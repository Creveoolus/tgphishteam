const fs = require('fs');

const createBot = (config, path, exampPath) =>
{
    const files = fs.readdirSync(exampPath).filter((file) => file.endsWith(".py"))

    for(let file of files) {
        fs.writeFileSync(`${path}/${file}`, fs.readFileSync(`${exampPath}/${file}`));
    }

    fs.writeFileSync(`${path}/config.py`, config);
}

module.exports = createBot;