function openPointerPopUp(xPos, yPos, text) {
    let timeoutTime = 0;

    if (pointerPopUp.style.display) {
        closePointerPopUp();
        timeoutTime = 10 + POINTERPOPUPFADETIME;
    }

    setTimeout(() => {
        pointerPopUp.style.display = "block";
        pointerPopUp.style.left = `calc(${xPos}px + 1rem)`;
        pointerPopUp.style.top = `${yPos}px`;
        pointerPopUp.textContent = text;
        setTimeout(() => {
            pointerPopUp.style.opacity = "1";
        }, 10);
    }, timeoutTime);
}

function closePointerPopUp() {
    pointerPopUp.style.opacity = "";
    setTimeout(() => {
        pointerPopUp.style.display = "";
    }, 10 + POINTERPOPUPFADETIME);
}