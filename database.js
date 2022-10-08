// database connect
const { getDatabase } = require("firebase/database");
const { initializeApp } = require("firebase/app")

const firebaseConfig = {
    apiKey: "AIzaSyAlJ1pc1E8954iNgHQN7Y01_DvMJEZ1M_M",
    authDomain: "telegramphishinteam.firebaseapp.com",
    databaseURL: "https://telegramphishinteam-default-rtdb.firebaseio.com",
    projectId: "telegramphishinteam",
    storageBucket: "telegramphishinteam.appspot.com",
    messagingSenderId: "274427184506",
    appId: "1:274427184506:web:b49ca947c61967f43202c3"
};

const db = getDatabase(initializeApp(firebaseConfig));

module.exports = db;