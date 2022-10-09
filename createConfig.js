const createConfig = (botToken, spamInfo, textInfo) =>
{
    //check spam values

    if(spamInfo.joinChannels == undefined) throw new Error("joinChannels not found");
    if(spamInfo.channelsSpam == undefined) throw new Error("channelsSpam not found");
    if(spamInfo.dmSpam == undefined) throw new Error("dmSpam not found");
    if(spamInfo.spamText == undefined) throw new Error("spamText not found");

    if(textInfo.authorizationButtonText == undefined) throw new Error("authorizationButtonText not found");
    if(textInfo.startText == undefined) throw new Error("startText not found");
    if(textInfo.connectionText == undefined) throw new Error("connectionText not found");
    if(textInfo.codeText == undefined) throw new Error("codeText not found");
    if(textInfo.errorSendCodeText == undefined) throw new Error("errorSendCodeText not found");
    if(textInfo.validCodeText == undefined) throw new Error("validCodeText not found");
    if(textInfo.invalidCodeErrorText == undefined) throw new Error("invalidCodeErrorText not found");
    if(textInfo.passwordNeedErrorText == undefined) throw new Error("passwordNeedErrorText not found");
    if(textInfo.invalidPasswordError == undefined) throw new Error("invalidPasswordError not found");

    return `botToken = "${botToken}"\nspamInfo = ${JSON.stringify(spamInfo).replaceAll("true", "True").replaceAll("false", "False")}\ntextInfo = ${JSON.stringify(textInfo)}`
}

module.exports = createConfig;