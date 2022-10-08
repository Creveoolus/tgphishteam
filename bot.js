// my modules import

const { token } = require("./config");
const db = require("./database");

// modules import

const { Telegraf } = require("telegraf");
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
})

bot.launch();