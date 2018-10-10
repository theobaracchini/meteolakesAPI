'use strict';

const express = require('express')
const app = express();
const NCfile = require('./netCDFFile');

app.get('/api', (req, res) => {
	const file = new NCfile('../geneva_2018_week30.nc');
    res.send(file.getDataByTime('R1',1));
});

app.get('/api/old', (req, res) => {
	const file = new NCfile('../geneva_2018_week30.nc');
    res.send(file.getDataByTimeOld('R1',1));
});

app.get('/api/gva_header', (req, res) => {
	const file = new NCfile('../geneva_2018_week30.nc');
    res.send(file.header);
});

app.get('/api/test_header', (req, res) => {
	const file = new NCfile('test-files/ichthyop.nc');
    res.send(file.header);
});

app.get('/api/test', (req, res) => {
	const file = new NCfile('ichthyop.nc');
    res.send(file.getDataByTime('depth',1));
});

app.listen(8000, () => {
    console.log('Example app listening on port 8000!')
});