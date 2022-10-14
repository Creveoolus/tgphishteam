const { Scenes: { WizardScene }, Telegraf } = require("telegraf");
const { ref, get, child, set, update } = require("firebase/database");
const { paymentsChannelId } = require("../config");

const db = require("../database");

const vivodScene = new WizardScene("vivodScene",
    async (ctx) => {
        console.log(ctx)

        ctx.scene.state = {}
        ctx.scene.state.lolz = ctx.message.text;

        await ctx.reply("Введите сумму вывода(в рублях): ");
        return ctx.wizard.next();
    },

    async (ctx) => {
        let sum = Number(ctx.message.text);
        if(isNaN(sum)) sum = 0;

        const user_data = await get(child(ref(db), `users/${ctx.chat.id}`));
        let user = user_data.val();

        if(sum <= 0) { await ctx.reply("Вы не можете вывести 0 или отрицательное значение баланса"); return ctx.scene.leave(); }
        if(sum > user.balance) { await ctx.reply("У вас недостаточно средств для вывода! "); return ctx.scene.leave(); }

        user.balance -= sum

        await update(child(ref(db), `users/${ctx.chat.id}`), user);
        await ctx.telegram.sendMessage(paymentsChannelId, `Была заказана выплата!\n\nСумма: ${sum}\nЛолз: ${ctx.scene.state.lolz}\nТелеграмм: ${ctx.chat.username == undefined ? ctx.chat.id : `@${ctx.chat.username}(${ctx.chat.id})`}`);

        await ctx.reply("Заявка на вывод успешно создана!");
        return ctx.scene.leave();
    }
)

vivodScene.enter(async(ctx) => {
    ctx.reply("Введите ссылку на ваш лолз\n\nВНИМАТЕЛЬНО ПЕРЕПРОВЕРЬТЕ ССЫЛКУ, АДМИНИСТРАЦИЯ МОЖЕТ ВАМ ИЗ-ЗА ЭТОГО НЕ ВЫПЛАТИТЬ.");
})

module.exports = vivodScene;