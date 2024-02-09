// Stores usernames in rooms and codes currently in use
const publicRooms = {}; // Identified by room name
const privateRooms = {}; // Identified by room code
const roomCodes = new Set();

/** Generates an alphanumeric code (length being a multiple of 8) */
function generateCode(length) {
    let code = "";
    for (let i = 0; i < length; i++)
        code += Math.random().toString(36).substring(2, 10).toUpperCase();
    return code;
}

/** Returns the type of a room based on roomId (undefined if not found) */
function getRoomType(roomId) {
    if (publicRooms[roomId])
        return "public";
    else if (privateRooms[roomId])
        return "private";
    else
        return undefined;
}

/** Attempts to return a random public room with its user count */
function getPublicRoom(usernames, attempts) {
    // Returns empty object if there are no public rooms
    const keys = Object.keys(publicRooms);
    if (!keys.length)
        return {};

    // Searches for a random room the user has not joined yet (until attempts run out)
    let roomId;
    do {
        roomId = keys[Math.floor(Math.random() * keys.length)];
        attempts--;
    } while (attempts && publicRooms[roomId].includes(usernames[roomId]));

    // Returns the roomId and user count of the room if found, empty object otherwise
    return (attempts) ? { roomId, users: publicRooms[roomId].length } : {};
}

/** Creates a new room identified with either name or generated code */
function createRoom(username, name, type) {
    // Creates the room based on type
    if (type === "public") {
        publicRooms[name] = [username];
        return name;
    } else {
        // Creates a unique room code (private only)
        let code = "";
        do code = generateCode(4)
            while (roomCodes.has(code));

        // Adds the code to set of used codes
        roomCodes.add(code);
        privateRooms[code] = [username];
        return code;
    }
}

/** Adds a user to a room based on roomId and type */
function joinRoom(username, roomId, type) {
    const room = (type === "public") ? publicRooms[roomId] : privateRooms[roomId];

    // Checks if username is taken, returns a new one if so (loops until one is unused)
    let i = 1;
    let newUsername = username;
    while (room.includes(newUsername)) 
        newUsername = `User_${i++}`;
    room.push(newUsername);
    return newUsername;
}

/** Removes a user from a room based on roomId and type */
function leaveRoom(username, roomId, type) {
    const rooms = (type === "public") ? publicRooms : privateRooms;

    // Removes username from room, deletes the room if empty
    rooms[roomId].splice(rooms[roomId].indexOf(username), 1);
    if (rooms[roomId].length === 0)
        delete rooms[roomId];
}

module.exports = { getRoomType, getPublicRoom, createRoom, joinRoom, leaveRoom };