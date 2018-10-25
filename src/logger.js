'use-strict';

const winston = require('winston');
const format = winston.format;
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const split = require('split');
require('winston-daily-rotate-file');

// ensure log directory exists
const logDirectory = path.join(__dirname, '..', 'logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const myFormat = format.printf(info => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const transport = new (winston.transports.DailyRotateFile)({
    filename: 'application-%DATE%.log',
    dirname: logDirectory,
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});

const logger = winston.createLogger({
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

let winstonStream = split().on('data', function (line) {
    logger.info(line);
});

const morganLogger = morgan(':method :url :status :res[content-length] - :response-time ms', { stream: winstonStream });

logger.info('logger created with level ' + logger.level + ' in ' + process.env.NODE_ENV + ' environment.');

module.exports.logger = logger;
module.exports.morgan = morganLogger;
