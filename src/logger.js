'use-strict';

const winston = require('winston');
const format = winston.format;
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const split = require('split');
const config = require('config/config')();
require('winston-daily-rotate-file');

// ensure log directory exists
const logDirectory = config.log_path;
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const myFormat = format.printf(info => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

function createLogger(logName) {
    let directory = path.join(logDirectory, logName);

    fs.existsSync(directory) || fs.mkdirSync(directory);

    let transport = new (winston.transports.DailyRotateFile)({
        filename: `${logName}-%DATE%.log`,
        dirname: directory,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
    });

    let logger = winston.createLogger({
        levels: winston.config.syslog.levels,
        format: format.combine(
            format.label({ label: 'meteolakesAPI' }),
            format.timestamp(),
            myFormat
        ),
        transports: [transport]
    });

    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        logger.add(new winston.transports.Console({ level: 'debug' }));
    }

    return logger;
}

const logger = createLogger('application');
const requestLogger = createLogger('request');

let winstonStream = split().on('data', function (line) {
    requestLogger.info(line);
});
const morganLogger = morgan(':remote-addr :method :url HTTP/:http-version :status :res[content-length] :response-time ms', { stream: winstonStream });

logger.info('logger created with level ' + logger.level + ' in ' + process.env.NODE_ENV + ' environment.');

module.exports.logger = logger;
module.exports.request = morganLogger;
