'use-strict';

const app = require('app');
const config = require('config/config')();
const logger = require('logger').logger;

app.listen(config.port, () => {
    logger.info(`Meteolakes API listening on port ${config.port} in ${config.mode} mode!`);
    if (config.mode === 'production') {
        console.log(`Meteolakes API listening on port ${config.port} in ${config.mode} mode!`); // eslint-disable-line no-console
    }
});
