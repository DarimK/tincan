const socket = io((window.location.hostname === "localhost") ? "/" : "https://tincan.onrender.com");


window.addEventListener("resize", () => {
    setWindowSize();
    closePointerPopUp();
});

document.addEventListener("DOMContentLoaded", () => {
    setWindowSize();
    setStorageType();
    if (!storageType) {
        disableElement(browserSaveButton);
        browserSaveButton.textContent = "Disabled";
    }

    const loadingTimeout = setTimeout(() => {
        openLoadingPage("FINDING SERVER");
    }, 5000);

    socket.on("connect", () => {
        if (getStorageItem("saveData") === 0) {
            browserSaveButton.textContent = "Disabled";
            storage = {};
            storageType = undefined;
        }
        loadSavedData();
        closeInfoPopUp();

        setTimeout(() => {
            clearTimeout(loadingTimeout);
            closeLoadingPage();
        }, 1000);
    
        if (root.classList.contains("darkTheme"))
            themeButton.textContent = "Dark";
        else
            themeButton.textContent = "Light";
    });

    socket.on("sent", (data) => {
        setMessage(data.roomId, data.username, data.message);
    });

    socket.on("data", (data) => {
        if (data.type === "name") {
            displayNameInput.placeholder = data.username;
            defaultUsername = data.username;
            if (!ignoreErrors)
                saveData();
        }

        if (data.type === "publicroom") {
            if (data.roomId && !publicNodes[data.roomId]) {
                addPublicRoom(data.roomId, data.users);
                addPublicButtonClick(data.roomId, () => {
                    removePublicRoom(data.roomId);
                    socket.emit("join", { roomId: data.roomId });
                });
            }
        }
    
        if (data.type === "create") {
            roomAdded(data.roomId);
            setMessage(data.roomId, defaultUsername, "");
        }
    
        if (data.type === "userjoin") {
            setMessage(data.roomId, data.username, "");
        }
    
        if (data.type === "join") {
            roomAdded(data.roomId);
            setMessage(data.roomId, data.username, "");
        }
    
        if (data.type === "userleave") {
            removeMessage(data.roomId, data.username);
        }
    });
    
    socket.on("error", (errorMessage) => {
        if (!ignoreErrors) {
            closeAllPopUps();
            openInfoPopUp("Error", errorMessage, "OK");
        }
        else {
            setTimeout(() => {
                ignoreErrors = false;
            }, 1000);
        }
    });

    socket.on("disconnect", () => {
        reset();
        closeAllPopUps();
        openLoadingPage();
        openInfoPopUp("Error", "Connection has been lost with the server. Please refresh the page or come back later.", "OK");
    });
});


displayPage.addEventListener("click", () => {
    closeSideBar();
});

messageInput.addEventListener("keyup", (event) => {
    if ((event.key === "Enter" || event.keyCode === 13))
        sendMessage();
});

messageButton.addEventListener("click", sendMessage);

leaveButton.addEventListener("click", () => {
    const roomId = openedRoom;
    closeRoomDisplay();
    removeRoom(roomId);
    removeIcon(roomId);
    saveData();
    setTimeout(openSideBar, 10);
    socket.emit("leave", { roomId });
});

refreshButton.addEventListener("click", () => {
    removePublicRoom();
    requestPublicRooms(MAXPUBLICROOMREQUEST);
});

displayNameButton.addEventListener("click", () => {
    const username = displayNameInput.value;
    displayNameInput.value = "";
    socket.emit("namechange", { username });
});

themeButton.addEventListener("click", () => {
    root.classList.toggle("darkTheme");
    if (root.classList.contains("darkTheme"))
        themeButton.textContent = "Dark";
    else
        themeButton.textContent = "Light";
    saveData();
});

browserSaveButton.addEventListener("click", () => {
    if (storageType) {
        clearStorageItems();
        setStorageItem("saveData", 0);
        browserSaveButton.textContent = "Disabled";
        storage = {};
        storageType = undefined;
    }
    else {
        setStorageType();
        clearStorageItems();
        browserSaveButton.textContent = "Enabled";
    }
    saveData();
});


iconList.addEventListener("scroll", () => {
    closePointerPopUp();
});

addButton.addEventListener("click", () => {
    openAddPopUp();
});

publicButton.addEventListener("click", () => {
    closeSideBar();
    closeAllDisplays();
    openPublicDisplay();
    removePublicRoom();
    requestPublicRooms(5);
});

settingsButton.addEventListener("click", () => {
    closeSideBar();
    closeAllDisplays();
    openSettingsDisplay();
});


logoButton.addEventListener("click", () => {
    if (sideBar.style.left != "-15rem")
        closeSideBar();
    else
        openSideBar();
});


darkFilter.addEventListener("click", () => {
    closeAllPopUps();
});

createRoomButton.addEventListener("click", () => {
    const name = createRoomInput.value;
    let type = "public";
    if (name === "")
        type = "private";
    socket.emit("create", { name, type });
});

joinRoomButton.addEventListener("click", () => {
    const roomId = joinRoomInput.value;
    socket.emit("join", { roomId });
});

closeAddPopUpButton.addEventListener("click", () => {
    closeAddPopUp();
});

infoPopUpButton.addEventListener("click", () => {
    closeInfoPopUp();
});