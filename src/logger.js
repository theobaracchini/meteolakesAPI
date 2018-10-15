'use-strict';

const winston = require('winston');
const format = winston.format;

const myFormat = format.printf(info => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const level = process.env.LOG_LEVEL || 'debug';

const logger = winston.createLogger({
    level: level,
    format: format.combine(
        format.label({ label: 'meteolakesAPI' }),
        format.timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console());
}

logger.info('logger created with level ' + level + ' in ' + process.env.NODE_ENV + ' environment.');

module.exports = logger;
