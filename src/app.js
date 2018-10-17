'use strict';

const csv = require('csv-express'); // eslint-disable-line no-unused-vars
const express = require('express');
const helmet = require('helmet');
const controller = require('controller');
const logger = require('logger');

const app = express();
app.use(helmet());

app.get('/api/:lake/:variable/:time/:depth', (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=data_test.csv');
    res.set('Content-Type', 'text/csv');
    res.csv(controller.getVariable(req.params.lake, req.params.variable, req.params.time, req.params.depth));
});

app.get('/api/:lake/:variable/:time/', (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=data_test.csv');
    res.set('Content-Type', 'text/csv');
    res.csv(controller.getVariable(req.params.lake, req.params.variable, req.params.time, null));
});

app.use(function (err, req, res, next) {
    logger.error(err.stack);
    res.status(500).send(err.message);
});

app.listen(8000, () => {
    console.log('Example app listening on port 8000!');
});
