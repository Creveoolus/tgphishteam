const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function runCommand(command) {
    try {
        const {stdout, stderr, error} = await exec(command);

        return stdout;
    }
    catch {
        return "";
    }
}

module.exports = runCommand;