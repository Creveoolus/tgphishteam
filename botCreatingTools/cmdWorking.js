const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function runCommand(command) {
    const { stdout, stderr, error } = await exec(command);
    if(stderr){console.error('stderr:', stderr);}
    if(error){console.error('error: ', error);}
    return stdout;
}

module.exports = runCommand;