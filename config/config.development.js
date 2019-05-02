'use-strict';

let path = require('path');

module.exports = {
    mode: 'development',
    data_path: path.join(path.dirname(path.dirname(__dirname)), 'meteolakesAPI_data'),
    port: 8000,
    log_path: 'C:\\temp\\meteolakesAPI'
};
