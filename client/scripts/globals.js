// Document objects
const root = document.querySelector(":root");

const loadingPage = document.getElementById("loadingPage");

const displayPage = document.getElementById("displayPage");

const roomDisplay = document.getElementById("roomDisplay");
const messagesArea = document.getElementById("messagesArea");
const leaveButton = document.getElementById("leaveButton");
const messageInput = document.getElementById("messageInput");
const messageButton = document.getElementById("messageButton");

const publicDisplay = document.getElementById("publicDisplay");
const refreshButton = document.getElementById("refreshButton");

const settingsDisplay = document.getElementById("settingsDisplay");
const displayNameInput = document.getElementById("displayNameInput");
const displayNameButton = document.getElementById("displayNameButton");
const themeButton = document.getElementById("themeButton");
const browserSaveButton = document.getElementById("browserSaveButton");

const sideBar = document.getElementById("sideBar");
const iconList = document.getElementById("iconList");
const addButton = document.getElementById("addButton");
const publicButton = document.getElementById("publicButton");
const settingsButton = document.getElementById("settingsButton");

const logoButton = document.getElementById("logoButton");

const pointerPopUp = document.getElementById("pointerPopUp");

const popUps = document.getElementById("popUps");
const darkFilter = document.getElementById("darkFilter");

const addPopUp = document.getElementById("addPopUp");
const createRoomInput = document.getElementById("createRoomInput");
const createRoomButton = document.getElementById("createRoomButton");
const joinRoomInput = document.getElementById("joinRoomInput");
const joinRoomButton = document.getElementById("joinRoomButton");
const closeAddPopUpButton = document.getElementById("closeAddPopUpButton");

const infoPopUp = document.getElementById("infoPopUp");
const infoPopUpButton = document.getElementById("infoPopUpButton");

const templates = document.getElementById("templates");

// Node lists for modifiable elements
const roomNodes = {};
const roomMessageNodes = {};
const publicNodes = {};
const iconNodes = {};

// Constants
const LOADINGPAGEFADETIME = 1000;
const ROOMCODELENGTH = 32;
const MAXICONTEXTLENGTH = 2;
const ICONBUTTONRAND = 64;
const DOUBLECLICKDELAYTIME = 1000;
const POINTERPOPUPFADETIME = 250;
const MAXPUBLICROOMREQUEST = 5;

// Variables
let ignoreErrors = false;
let storage = {};
let storageType = undefined;
let defaultUsername = "User_1";
let openedRoom = undefined;