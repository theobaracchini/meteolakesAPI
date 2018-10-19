'use strict';

const csv = require('csv-express'); // eslint-disable-line no-unused-vars
const express = require('express');
const helmet = require('helmet');
const controller = require('controller');
const log = require('logger');
const morgan = log.morgan;
const logger = log.logger;

const app = express();

app.use(morgan);

app.use(helmet());

app.get('/api/:lake/:variable/:time/:depth', (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=data_test.csv');
    res.set('Content-Type', 'text/csv');
    res.csv(controller.getVariable(req.params.lake, req.params.variable, req.params.time, req.params.depth));
});

app.get('/api/:lake/:variable/:time/', (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=data_test.csv');
    res.set('Content-Type', 'text/csv');
    res.csv(controller.getVariable(req.params.lake, req.params.variable, req.params.time));
});

app.use(function (err, req, res, next) {
    logger.error(err.stack);
    let statusCode = 500;
    if (err.message.includes('Error occured during Meteolakes API call:')) {
        statusCode = 400;
    }
    res.status(statusCode).send(err.message);
});

app.listen(8000, () => {
    logger.info('Meteolakes API listening on port 8000!');
});

module.exports = app;
