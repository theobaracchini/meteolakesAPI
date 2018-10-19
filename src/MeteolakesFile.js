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
    }

    getVariable (variable, time, depth) {
        let size = this.colSize * this.rowSize;

        let timeIndex = utils.getIndexFromValue(this.timeArray, dateUtils.transformDate(time));
        let startIndex = 0;
        let message = '';

        if(depth !== null && depth !== undefined) {
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
}

module.exports = MeteolakesFile;
