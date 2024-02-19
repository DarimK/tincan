function openRoomDisplay(roomId) {
    roomDisplay.style.display = "block";
    roomNodes[roomId].style.display = "block";
    disableElement(iconNodes[roomId]);
    openedRoom = roomId;
}

function closeRoomDisplay() {
    roomDisplay.style.display = "";
    messageInput.value = "";
    if (openedRoom) {
        roomNodes[openedRoom].style.display = "";
        enableElement(iconNodes[openedRoom]);
        openedRoom = undefined;
    }
}

function setMessage(roomId, username, message) {
    const messageNodes = roomMessageNodes[roomId];

    if (messageNodes[username]) {
        if (messageNodes[username].children[1].textContent === message) {
            messageNodes[username].children[1].textContent = message;
            return;
        }
        messageNodes[username].children[1].textContent = message;
    }
    else {
        messageNodes[username] = templates.children[0].cloneNode(true);
        messageNodes[username].children[0].textContent = username;
        messageNodes[username].children[1].textContent = message;
        roomNodes[roomId].appendChild(messageNodes[username]);
    }

    if (roomNodes[roomId].style.display !== "") {
        messageNodes[username].style.transition = "none";
        messageNodes[username].style.backgroundColor = "var(--displayDivMain)";
        setTimeout(() => {
            messageNodes[username].style.transition = "";
            messageNodes[username].style.backgroundColor = "";
        }, 500);
    }
}

function removeMessage(roomId, username) {
    if (roomMessageNodes[roomId][username]) {
        roomMessageNodes[roomId][username].remove();
        delete roomMessageNodes[roomId][username];
    }
}

function addRoom(roomId) {
    roomNodes[roomId] = document.createElement("div");
    roomMessageNodes[roomId] = {};
    messagesArea.appendChild(roomNodes[roomId]);
}

function removeRoom(roomId) {
    roomNodes[roomId].remove();
    delete roomNodes[roomId];
    delete roomMessageNodes[roomId];
    if (roomId === openedRoom)
        openedRoom = undefined;
}


function openPublicDisplay() {
    publicDisplay.style.display = "block";
    disableElement(publicButton);
}

function closePublicDisplay() {
    publicDisplay.style.display = "";
    enableElement(publicButton);
}

function addPublicRoom(name, userCount) {
    publicNodes[name] = templates.children[1].cloneNode(true);
    publicNodes[name].children[0].children[0].textContent = name;
    publicNodes[name].children[0].children[1].textContent = `${userCount} Users`;
    publicDisplay.insertBefore(publicNodes[name], refreshButton);
}

function removePublicRoom(name = undefined) {
    if (name) {
        publicNodes[name].remove();
        delete publicNodes[name];
    }
    else {
        for (id in publicNodes) {
            publicNodes[id].remove();
            delete publicNodes[id];
        }
    }
}

function addPublicButtonClick(name, clickMethod) {
    publicNodes[name].children[1].addEventListener("click", clickMethod);
}


function openSettingsDisplay() {
    settingsDisplay.style.display = "block";
}

function closeSettingsDisplay() {
    settingsDisplay.style.display = "";
}


function closeAllDisplays() {
    closeRoomDisplay();
    closePublicDisplay();
    closeSettingsDisplay();
}