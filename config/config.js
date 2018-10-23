'use-strict';

let configData = null;

module.exports = function () {
    // if the static data was already set. return it
    if (configData !== null && configData !== undefined) {
        return configData;
    }
};

configData = {};

// LOAD JSON
if (process.env.NODE_ENV === 'production') {
    configData = require('config/config.production.js');
} else {
    configData = require('config/config.development.js');
}
