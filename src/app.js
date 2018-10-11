'use strict';

const csv = require('csv-express'); // eslint-disable-line no-unused-vars
const express = require('express');
const helmet = require('helmet');
const controller = require('./controller');

const app = express();
app.use(helmet());

app.get('/api/:variable/:time/:depth', (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=data_test.csv');
    res.set('Content-Type', 'text/csv');
    res.csv(controller.getVariable(req.params.variable, req.params.time, req.params.depth));
});

app.get('/api/:variable/:time/', (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=data_test.csv');
    res.set('Content-Type', 'text/csv');
    res.csv(controller.getVariable(req.params.variable, req.params.time, null));
});

app.listen(8000, () => {
    console.log('Example app listening on port 8000!');
});
