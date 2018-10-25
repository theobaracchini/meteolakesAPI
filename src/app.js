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

app.get('/api/layer/:lake/:variable/:time/:depth', (req, res) => {
    res.setHeader('Content-disposition', `attachment; filename=Layer_${req.params.lake}_${req.params.variable}_${req.params.depth}_${req.params.time}.csv`);
    res.set('Content-Type', 'text/csv');
    res.csv(controller.getVariable(req.params.lake, req.params.variable, req.params.time, req.params.depth));
});

app.get('/api/layer/:lake/:variable/:time/', (req, res) => {
    res.setHeader('Content-disposition', `attachment; filename=Layer_${req.params.lake}_${req.params.variable}_${req.params.time}.csv`);
    res.set('Content-Type', 'text/csv');
    res.csv(controller.getVariable(req.params.lake, req.params.variable, req.params.time));
});

app.get('/api/coordinates/:x/:y/:lake/:variable/:startTime/:endTime', (req, res) => {
    res.setHeader('Content-disposition', `attachment; filename=Table_${req.params.lake}_${req.params.variable}_coor-${req.params.x}-${req.params.y}_from${req.params.startTime}_to${req.params.endTime}.csv`);
    res.set('Content-Type', 'text/csv');
    res.csv(controller.getValue(req.params.x, req.params.y, req.params.lake, req.params.variable, req.params.startTime, req.params.endTime));
});

app.get('/api/coordinates/:x/:y/:lake/:variable/:startTime/:endTime/:depth', (req, res) => {
    res.setHeader('Content-disposition', `attachment; filename=Table_${req.params.lake}_${req.params.variable}_coor-${req.params.x}-${req.params.y}_from${req.params.startTime}_to${req.params.endTime}.csv`);
    res.set('Content-Type', 'text/csv');
    res.csv(controller.getValue(req.params.x, req.params.y, req.params.lake, req.params.variable, req.params.startTime, req.params.endTime, req.params.depth));
});

app.use(function (err, req, res, next) {
    logger.error(err.stack);
    let statusCode = 500;
    if (err.message.includes('Error occured during Meteolakes API call:')) {
        statusCode = 400;
    }
    res.status(statusCode).send(err.message);
});

module.exports = app;
