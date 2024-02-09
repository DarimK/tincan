function openSideBar() {
    sideBar.style.left = "";
    sideBar.style.willChange = "left";
    logoButton.style.rotate = "";
}

function closeSideBar() {
    sideBar.style.left = "-15rem";
    sideBar.style.willChange = "";
    logoButton.style.rotate = "180deg";
    closePointerPopUp();
}

function addIcon(roomId) {
    iconNodes[roomId] = templates.children[2].cloneNode(true);

    if (roomId.length === ROOMCODELENGTH)
        iconNodes[roomId].textContent = "Private";
    else
        iconNodes[roomId].textContent = roomId.substring(0, MAXICONTEXTLENGTH).toUpperCase();
    
    iconList.insertBefore(iconNodes[roomId], addButton);
    iconNodes[roomId].style.backgroundColor = generateColor(96, 96, 96, ICONBUTTONRAND);
    iconNodes[roomId].scrollIntoView();
}

function removeIcon(roomId) {
    iconNodes[roomId].remove();
    delete iconNodes[roomId];
}

function addIconButtonClick(roomId, clickMethod, doubleClickMethod) {
    let recentClick = false;

    iconNodes[roomId].addEventListener("click", (event) => {
        if (recentClick)
            doubleClickMethod(event);
        else {
            recentClick = true;
            clickMethod(event);
            setTimeout(() => {
                recentClick = false;
            }, DOUBLECLICKDELAYTIME);
        }
    });
}