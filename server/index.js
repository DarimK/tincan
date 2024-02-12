const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const { getRoomType, getPublicRoom, createRoom, joinRoom, leaveRoom } = require("./rooms");
const { validInput, validStringName } = require("./misc");

// Initializes server and frontend directory
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "https://www.darim.me",
        methods: ["GET", "POST"]
    }
});
const clientPath = path.join(__dirname, "../client");
const PORT = process.env.PORT || 3000;
app.use(express.static(clientPath));

// Constants
const MAXUSERROOMS = 10;
const MINNAMELENGTH = 2;
const MAXNAMELENGTH = 20;
const ROOMCODELENGTH = 32; // Must be larger than 32 (prevent collision with public rooms)
const MAXMSGLENGTH = 500;
const RATELIMITTIME = 500;


// Handles all communication between server and client
io.on("connection", (socket) => {
    console.log(`connection ${Date(Date.now())}`);

    // let failedAttempts = 0; //might use later to manage spam
    let defaultUsername = "User_1";
    let usernames = {};
    let userRooms = [];
    let lastMessageTime = 0;

    // Handles default username change requests
    socket.on("namechange", (input) => {
        // Input validation and error responses
        if (!validInput(input, ["username"])) {
            socket.emit("error", "Bad request.");
            return;
        }
        const { username } = input;
        if (username.length < MINNAMELENGTH || username.length > MAXNAMELENGTH || !validStringName(username)) {
            socket.emit("error", `Invalid username. You can use ${MINNAMELENGTH}-${MAXNAMELENGTH} letters or numbers, with underscores in-between.`);
            return;
        }

        // Stores the new default username
        defaultUsername = username;

        // Acknowledges change with username
        socket.emit("data", {
            type: "name",
            username
        });
    });

    // Handles fetching of random public room requests
    socket.on("getpublic", () => {
        // Sends the user a random public room roomId and user count, or neither if none found
        socket.emit("data", {
            type: "publicroom",
            ...getPublicRoom(usernames, MAXUSERROOMS)
        });
    });

    // Handles room creation requests
    socket.on("create", (input) => {
        // Input validation and error responses
        if (!validInput(input, ["name", "type"])) {
            socket.emit("error", "Bad request.");
            return;
        }
        const { name, type } = input;
        if (userRooms.length >= MAXUSERROOMS) {
            socket.emit("error", `Maximum user rooms reached (${MAXUSERROOMS}).`);
            return;
        }
        if ((type !== "public" && type !== "private") || (type === "private" && name)) {
            socket.emit("error", "Invalid room type.");
            return;
        }
        if (type === "public" && (name.length < MINNAMELENGTH || name.length > MAXNAMELENGTH || !validStringName(name))) {
            socket.emit("error", `Invalid room name. You can use ${MINNAMELENGTH}-${MAXNAMELENGTH} letters or numbers, with underscores in-between.`);
            return;
        }
        if (getRoomType(name) === "public") {
            socket.emit("error", "Room already exists.");
            return;
        }

        // Creates the new room, assigns username, and adds room to user socket
        let roomId = createRoom(defaultUsername, name, type);
        usernames[roomId] = defaultUsername;
        userRooms.push(roomId);
        socket.join(roomId);

        // Acknowledges creation with roomId (for private rooms)
        socket.emit("data", {
            type: "create",
            roomId
        });
    });

    // Handles room join requests
    socket.on("join", (input) => {
        // Input validation and error responses
        if (!validInput(input, ["roomId"])) {
            socket.emit("error", "Bad request.");
            return;
        }
        const { roomId } = input;
        if (userRooms.length >= MAXUSERROOMS) {
            socket.emit("error", `Maximum user rooms reached (${MAXUSERROOMS}).`);
            return;
        }
        if (!roomId || roomId.length > ROOMCODELENGTH) {
            socket.emit("error", "Invalid room name or code.");
            return;
        }
        if (userRooms.includes(roomId)) {
            socket.emit("error", "Already joined this room.");
            return;
        }

        // Checks if room exists and stores its type
        const type = getRoomType(roomId);
        if (!type) {
            socket.emit("error", "Room does not exist.");
            return;
        }

        // Adds user to the room and assigns username
        let newUsername = joinRoom(defaultUsername, roomId, type);
        usernames[roomId] = newUsername;
        userRooms.push(roomId);

        // Broadcasts to others in the room that user joined
        io.to(roomId).emit("data", {
            type: "userjoin",
            roomId,
            username: newUsername
        });

        // Adds room to user socket
        socket.join(roomId);

        // Acknowledges join with user room username (when default username is taken)
        socket.emit("data", {
            type: "join",
            roomId,
            username: newUsername
        });
    });

    // Handles room leave requests
    socket.on("leave", (input) => {
        // Input validation and error responses
        if (!validInput(input, ["roomId"])) {
            socket.emit("error", "Bad request.");
            return;
        }
        const { roomId } = input;
        if (!roomId || roomId.length > ROOMCODELENGTH) {
            socket.emit("error", "Invalid room name or code.");
            return;
        }
        if (!userRooms.includes(roomId)) {
            socket.emit("error", "Not in this room.");
            return;
        }

        // Removes room from user socket
        socket.leave(roomId);

        // Broadcasts to others in the room that user left
        io.to(roomId).emit("data", {
            type: "userleave",
            roomId,
            username: usernames[roomId]
        });

        // Removes user from the room and removes username
        leaveRoom(usernames[roomId], roomId, getRoomType(roomId));
        delete usernames[roomId];
        userRooms.splice(userRooms.indexOf(roomId), 1);
    });

    // Handles message requests
    socket.on("message", (input) => {
        // Rate limits user messages
        const currentTime = Date.now();
        if (currentTime - lastMessageTime < RATELIMITTIME) {
            socket.emit("error", `Please space your messages ${RATELIMITTIME}ms apart from eachother.`);
            return;
        }
        lastMessageTime = currentTime;

        // Input validation and error responses
        if (!validInput(input, ["message", "roomId"])) {
            socket.emit("error", "Bad request.");
            return;
        }
        const { message, roomId } = input;
        if (!message || message.length > MAXMSGLENGTH) {
            socket.emit("error", `Please keep your messages under ${MAXMSGLENGTH} characters in length.`);
            return;
        }
        if (!roomId || roomId.length > ROOMCODELENGTH) {
            socket.emit("error", "Invalid room name or code.");
            return;
        }
        if (!userRooms.includes(roomId)) {
            socket.emit("error", "Not in this room.");
            return;
        }

        // Broadcasts message to everyone in the room
        io.to(roomId).emit("sent", {
            roomId,
            username: usernames[roomId],
            message
        });
    });

    // Handles user disconnection
    socket.on("disconnect", () => {
        console.log(`disconnection ${Date(Date.now())}`);

        // Removes all rooms from user socket
        socket.leaveAll();
        
        // Removes user from all associated rooms
        for (let i = 0; i < userRooms.length; i++) {
            const roomId = userRooms[i];

            // Broadcasts to others in the room that user left
            io.to(roomId).emit("data", {
                type: "userleave",
                roomId,
                username: usernames[roomId]
            });

            // Removes user from the room
            leaveRoom(usernames[roomId], roomId, getRoomType(roomId));
        }
    });
});


// Server port
server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});