function openAddPopUp() {
    popUps.style.display = "flex";
    addPopUp.style.display = "flex";
    disableElement(addButton);
}

function closeAddPopUp() {
    popUps.style.display = "";
    addPopUp.style.display = "";
    enableElement(addButton);
    createRoomInput.value = "";
    joinRoomInput.value = "";
}


function openInfoPopUp(titleText, bodyText, buttonText) {
    infoPopUp.children[0].textContent = titleText;
    infoPopUp.children[1].textContent = bodyText;
    infoPopUp.children[2].children[0].textContent = buttonText;
    popUps.style.display = "flex";
    infoPopUp.style.display = "flex";
}

function closeInfoPopUp() {
    popUps.style.display = "";
    infoPopUp.style.display = "";
    infoPopUp.children[0].textContent = "";
    infoPopUp.children[1].textContent = "";
    infoPopUp.children[2].children[0].textContent = "";
}


function closeAllPopUps() {
    closeAddPopUp();
    closeInfoPopUp();
}