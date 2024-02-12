function generateColor(red, green, blue, rand) {
    const redInt = Math.floor(red + Math.random() * rand * 2 - rand + 1);
    const greenInt = Math.floor(green + Math.random() * rand * 2 - rand + 1);
    const blueInt = Math.floor(blue + Math.random() * rand * 2 - rand + 1);

    return "#" +
        ((redInt < 16) ? (redInt <= 0) ? "00" : "0" + redInt.toString(16) : redInt.toString(16)) +
        ((greenInt < 16) ? (greenInt <= 0) ? "00" : "0" + greenInt.toString(16) : greenInt.toString(16)) +
        ((blueInt < 16) ? (blueInt <= 0) ? "00" : "0" + blueInt.toString(16) : blueInt.toString(16));
}

function enableElement(element) {
    element.disabled = false;
    element.classList.remove("noHover");
}

function disableElement(element) {
    element.disabled = true;
    element.classList.add("noHover");
}

function setWindowSize() {
    if (document.body.offsetHeight >= document.body.offsetWidth)
        document.querySelector(":root").style.fontSize = "1.5vw";
    else
        document.querySelector(":root").style.fontSize = "1.5vh";
}

function roomAdded(roomId) {
    addRoom(roomId);
    addIcon(roomId);
    addIconButtonClick(roomId, (event) => {
        openPointerPopUp(event.clientX, event.clientY, roomId);
    }, () => {
        if (openedRoom !== roomId) {
            closeSideBar();
            closeAllDisplays();
            openRoomDisplay(roomId);
        }
    });
    closeAllPopUps();
}

function reset() {
    for (id in roomNodes) {
        removeIcon(id);
        removeRoom(id);
    }
    removePublicRoom();
    closeAllDisplays();
    closeAllPopUps();
}

function setStorageType() {
    try {
        localStorage.setItem("test", "test");
        localStorage.removeItem("test");
        storage = localStorage;
        storageType = "local";
    } catch (e) {
        storage = {};
        storageType = undefined;
    }
}

function getStorageItem(key) {
    return (storage[key]) ? JSON.parse(storage[key]) : undefined;
}

function setStorageItem(key, item) {
    storage[key] = JSON.stringify(item);
}

function clearStorageItems() {
    for (key in storage)
        delete storage[key];
}

function saveData() {
    const roomIds = [];
    for (id in roomNodes)
        if (id.length !== ROOMCODELENGTH)
            roomIds.push(id);

    setStorageItem("roomIds", roomIds);
    setStorageItem("defaultUsername", defaultUsername);
    setStorageItem("theme", (root.classList.contains("darkTheme")) ? "dark" : "light");
}

function loadSavedData() {
    try {
        if (getStorageItem("saveData") === 0)
            return;
        
        if (getStorageItem("theme") === "dark")
            root.classList.add("darkTheme");

        ignoreErrors = true;
        let username = getStorageItem("defaultUsername");
        socket.emit("namechange", { username });

        const roomIds = getStorageItem("roomIds") || [];
        for (id of roomIds) {
            socket.emit("create", { name: id, type: "public" });
            socket.emit("join", { roomId: id });
        }
    } catch (e) {
        console.log("cleared invalid data");
        clearStorageItems();
    }
}

function sendMessage() {
    if (messageInput.value) {
        let message = messageInput.value;
        messageInput.value = "";
        socket.emit("message", { message, roomId: openedRoom });
    }
}

function requestPublicRooms(amount) {
    if (amount > 0) {
        disableElement(refreshButton);
        refreshButton.textContent = "Searching...";
        setTimeout(() => {
            if (publicDisplay.style.display === "block") {
                requestPublicRooms(amount - 1);
                socket.emit("getpublic");
            }
        }, 500);
    }
    else {
        enableElement(refreshButton);
        refreshButton.textContent = "Refresh";
    }
}