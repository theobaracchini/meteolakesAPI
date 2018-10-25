'use strict';

const fs = require('fs');
const NetCDFReader = require('../../netcdfjs');
const dimensions = require('enum/dimensions');
const variables = require('enum/variables');
const logger = require('logger').logger;
const utils = require('utils');
const dateUtils = require('date');

class MeteolakesFile {
    constructor (path) {
        let data = null;
        try {
            data = fs.readFileSync(path);
        } catch (err) {
            utils.meteolakesError(true, err.message);
        }

        this.path = path;
        this.reader = new NetCDFReader(data); // read the header

        this.header = this.reader.header;
        this.dimensions = this.reader.dimensions;
        this.variables = this.reader.variables;

        this.depthSize = this.dimensions.find(dim => dim.name === dimensions.Z).size;
        this.colSize = this.dimensions.find(dim => dim.name === dimensions.Y).size;
        this.rowSize = this.dimensions.find(dim => dim.name === dimensions.X).size;

        this.timeArray = this.reader.getDataVariable(variables.TIME);
        this.depthArray = this.reader.getDataVariable(variables.DEPTH);
        this.LongitudeArray = utils.to2DArray(this.reader.getDataVariable(variables.LONGITUDE), this.colSize, this.rowSize);
        this.LatitudeArray = utils.to2DArray(this.reader.getDataVariable(variables.LATITUDE), this.colSize, this.rowSize);
    }

    getVariable (variable, time, depth) {
        let size = this.colSize * this.rowSize;

        let timeIndex = utils.getIndexFromValue(this.timeArray, dateUtils.transformDate(time));
        let startIndex = 0;
        let message = '';

        if (depth !== null && depth !== undefined) {
            let depthIndex = utils.getIndexFromValue(this.depthArray, Math.abs(depth) * -1);
            startIndex = timeIndex * this.depthSize * size + depthIndex * size;
            message = `Retrieve ${variable} data from file ${this.path} at time index ${timeIndex} and depth index ` +
                `${depthIndex} (initial index = 0) on a 2D array of size ${this.rowSize}x${this.colSize}`;
        } else {
            startIndex = timeIndex * size;
            message = `Retrieve ${variable} data from file ${this.path} at time index ${timeIndex} ` +
                `(initial index = 0) on a 2D array of size ${this.rowSize}x${this.colSize}`;
        }

        let result = this.reader.getDataVariableSlice(variable, startIndex, size);

        logger.info(message);

        return utils.to2DArray(result, this.colSize, this.rowSize);
    }

    getValue (x, y, variable, startTime, endTime, depth) {
        let startTimeIndex = utils.getIndexFromValue(this.timeArray, dateUtils.transformDate(startTime));
        let endTimeIndex = utils.getIndexFromValue(this.timeArray, dateUtils.transformDate(endTime));
        let timeSize = endTimeIndex - startTimeIndex + 1;
        let coordinates = utils.getCoordinatesIndex(this.LatitudeArray, this.LongitudeArray, x, y);
        let colIndex = coordinates.N;
        let rowIndex = coordinates.M;
        let depthSize = 1;
        let message = '';
        let result = [];

        if ((depth || depth === 0) && depth !== 'all') {
            let depthIndex = utils.getIndexFromValue(this.depthArray, Math.abs(depth) * -1);
            message = `Retrieve ${variable} data from file ${this.path} at position ` +
                `(${startTimeIndex}-${endTimeIndex}, ${depthIndex}, ${rowIndex}, ${colIndex}) (initial index = 0)`;
            result = this.reader.getDataVariableFiltered(variable, startTimeIndex, timeSize, depthIndex, depthSize, rowIndex, 1, colIndex, 1);
        } else if (depth === 'all') {
            depthSize = this.depthArray.length;
            message = `Retrieve ${variable} data from file ${this.path} at position ` +
                `(${startTimeIndex}-${endTimeIndex}, 0-${depthSize}, ${rowIndex}, ${colIndex}) (initial index = 0)`;
            result = this.reader.getDataVariableFiltered(variable, startTimeIndex, timeSize, 0, depthSize, rowIndex, 1, colIndex, 1);
        } else {
            message = `Retrieve ${variable} data from file ${this.path} at position ` +
                `(${startTimeIndex}-${endTimeIndex}, ${rowIndex}, ${colIndex}) (initial index = 0)`;
            result = this.reader.getDataVariableFiltered(variable, startTimeIndex, timeSize, rowIndex, 1, colIndex, 1);
        }

        logger.info(message);

        return utils.to2DArray(result, depthSize, timeSize);
    }
}

module.exports = MeteolakesFile;
