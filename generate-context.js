const fs = require('fs');

const baseConfig = JSON.parse(fs.readFileSync('cdk.base.json', 'utf8'));

function replacePlaceholders(config) {
    const newConfig = {};

    for (const environment in config) {
        newConfig[environment] = {};
        for (const key in config[environment]) {
            if (config[environment][key] === '<>') {
                newConfig[environment][key] = process.env[key] || '<changed>';
            } else {
                newConfig[environment][key] = config[environment][key];
            }
        }
    }

    return newConfig;
}

const contextConfig = replacePlaceholders(baseConfig);

fs.writeFileSync('cdk.context.json', JSON.stringify(contextConfig, null, 2), 'utf8');
console.log('File cdk.context.json successfully generated.');
