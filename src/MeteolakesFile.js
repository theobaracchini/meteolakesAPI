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
        this.ySize = this.dimensions.find(dim => dim.name === dimensions.Y).size;
        this.xSize = this.dimensions.find(dim => dim.name === dimensions.X).size;

        this.timeArray = this.reader.getDataVariable(variables.TIME);
        this.depthArray = this.reader.getDataVariable(variables.DEPTH);
        this.longitudeArray = this.reader.getDataVariable(variables.LONGITUDE);
        this.latitudeArray = this.reader.getDataVariable(variables.LATITUDE);
    }

    getLayer (variable, time, depth) {
        let size = this.ySize * this.xSize;

        let timeIndex = utils.getIndexFromValue(this.timeArray, dateUtils.transformDate(time));
        let startIndex = 0;
        let message = '';

        if (depth !== null && depth !== undefined) {
            let depthIndex = utils.getIndexFromValue(this.depthArray, Math.abs(depth) * -1);
            startIndex = timeIndex * this.depthSize * size + depthIndex * size;
            message = `Retrieve ${variable} data from file ${this.path} at time index ${timeIndex} and depth index ` +
                `${depthIndex} (initial index = 0) on a 2D array of size ${this.xSize}x${this.ySize}`;
        } else {
            startIndex = timeIndex * size;
            message = `Retrieve ${variable} data from file ${this.path} at time index ${timeIndex} ` +
                `(initial index = 0) on a 2D array of size ${this.xSize}x${this.ySize}`;
        }

        let result = this.reader.getDataVariableSlice(variable, startIndex, size);

        logger.info(message);

        return utils.formatTable(this.ySize, this.xSize, result);
    }

    getTable (x, y, variable, startTime, endTime, depth) {
        let table = [];

        let coordinates = utils.getCoordinatesIndex(utils.formatTable(this.ySize, this.xSize, this.latitudeArray),
            utils.formatTable(this.ySize, this.xSize, this.longitudeArray), x, y);
        let colIndex = coordinates.N;
        let rowIndex = coordinates.M;

        let startTimeIndex = utils.getIndexFromValue(this.timeArray, dateUtils.transformDate(startTime));
        let endTimeIndex = utils.getIndexFromValue(this.timeArray, dateUtils.transformDate(endTime));
        let timeSize = endTimeIndex - startTimeIndex + 1;

        let depthLabel = ['/'];
        let depthSize = 1;
        let depthIndex;

        if ((depth || depth === 0) && depth !== 'all') {
            depthIndex = utils.getIndexFromValue(this.depthArray, Math.abs(depth) * -1);
            depthLabel = [this.depthArray[depthIndex].toFixed(1)];
        } else if (depth === 'all') {
            depthIndex = 'all';
            depthSize = this.depthArray.length;
            depthLabel = this.depthArray.map(d => d.toFixed(1));
        }

        if (variable === 'velocity') {
            let resultVx = this.getValues(colIndex, rowIndex, variables.HORIZONTAL_VELOCITY, startTimeIndex, endTimeIndex, timeSize, depthIndex, depthSize);
            let resultVy = this.getValues(colIndex, rowIndex, variables.VERTICAL_VELOCITY, startTimeIndex, endTimeIndex, timeSize, depthIndex, depthSize);
            table = utils.formatTable(depthSize, timeSize, resultVx, resultVy);
        } else {
            let result = this.getValues(colIndex, rowIndex, variable, startTimeIndex, endTimeIndex, timeSize, depthIndex, depthSize);
            table = utils.formatTable(depthSize, timeSize, result);
        }

        let timeLabel = dateUtils.getTimeLabel(this.timeArray, startTimeIndex, endTimeIndex);

        return utils.addLabel(table, timeLabel, depthLabel);
    }

    getValues (colIndex, rowIndex, variable, startTimeIndex, endTimeIndex, timeSize, depthIndex, depthSize) {
        let message = '';
        let result = [];

        if ((depthIndex || depthIndex === 0) && depthIndex !== 'all') {
            message = `Retrieve ${variable} data from file ${this.path} at position ` +
                `(${startTimeIndex}-${endTimeIndex}, ${depthIndex}, ${rowIndex}, ${colIndex}) (initial index = 0)`;
            result = this.reader.getDataVariableFiltered(variable, startTimeIndex, timeSize, depthIndex, depthSize, rowIndex, 1, colIndex, 1);
        } else if (depthIndex === 'all') {
            message = `Retrieve ${variable} data from file ${this.path} at position ` +
                `(${startTimeIndex}-${endTimeIndex}, 0-${depthSize}, ${rowIndex}, ${colIndex}) (initial index = 0)`;
            result = this.reader.getDataVariableFiltered(variable, startTimeIndex, timeSize, 0, depthSize, rowIndex, 1, colIndex, 1);
        } else {
            message = `Retrieve ${variable} data from file ${this.path} at position ` +
                `(${startTimeIndex}-${endTimeIndex}, ${rowIndex}, ${colIndex}) (initial index = 0)`;
            result = this.reader.getDataVariableFiltered(variable, startTimeIndex, timeSize, rowIndex, 1, colIndex, 1);
        }

        logger.info(message);

        return result;
    }

    getWeekData (variable, depth) {
        let result = [];
        let size = this.xSize * this.ySize;
        let depthIndex = 0;

        if (depth || depth === 0) {
            depthIndex = utils.getIndexFromValue(this.depthArray, Math.abs(depth) * -1);
            depth = this.depthArray[depthIndex];
        }

        utils.addToWeekData(result, this.xSize, this.ySize, this.latitudeArray);
        utils.addToWeekData(result, this.xSize, this.ySize, this.longitudeArray);

        if (variable === variables.VELOCITY) {
            let dataX = this.reader.getDataVariableFiltered(variables.HORIZONTAL_VELOCITY, 0, this.timeArray.length, depthIndex, 1, 0, this.xSize, 0, this.ySize);
            for (let timeIndex = 0; timeIndex < this.timeArray.length; timeIndex++) {
                utils.addToWeekData(result, this.xSize, this.ySize, dataX.slice(timeIndex * size, (timeIndex + 1) * size));
            }

            let dataY = this.reader.getDataVariableFiltered(variables.VERTICAL_VELOCITY, 0, this.timeArray.length, depthIndex, 1, 0, this.xSize, 0, this.ySize);
            for (let timeIndex = 0; timeIndex < this.timeArray.length; timeIndex++) {
                utils.addToWeekData(result, this.xSize, this.ySize, dataY.slice(timeIndex * size, (timeIndex + 1) * size));
            }
        } else {
            utils.addToWeekData(result, this.xSize, this.ySize,
                utils.createDepthArray(depth, size));
            let data = (depth || depth === 0)
                ? this.reader.getDataVariableFiltered(variable, 0, this.timeArray.length, depthIndex, 1, 0, this.xSize, 0, this.ySize)
                : this.reader.getDataVariableFiltered(variable, 0, this.timeArray.length, 0, this.xSize, 0, this.ySize);

            for (let timeIndex = 0; timeIndex < this.timeArray.length; timeIndex++) {
                utils.addToWeekData(result, this.xSize, this.ySize, data.slice(timeIndex * size, (timeIndex + 1) * size));
            }
        }

        return result;
    }
}

module.exports = MeteolakesFile;
