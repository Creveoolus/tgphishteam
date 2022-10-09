const createConfig = require("./createConfig");

console.log(
    createConfig("1", {joinChannels: [], channelsSpam: [], dmSpam: true, spamText: "1"}, {startText: "hi!", connectionText: "hi!", codeText: "1", errorSendCodeText: "!", validCodeText: "1", invalidCodeErrorText: "invalidCodeErrorText", passwordNeedErrorText: "passwordNeedErrorText", invalidPasswordError:"1"})
);