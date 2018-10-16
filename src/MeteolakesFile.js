'use strict';

const fs = require('fs');
const NetCDFReader = require('../../netcdfjs');
const dimensions = require('./enum/dimensions');
const variables = require('./enum/variables');
const logger = require('./logger');
const utils = require('./utils');
const dateUtils = require('./date');

class MeteolakesFile {
    constructor (path) {
        const data = fs.readFileSync(path);
        this.reader = new NetCDFReader(data); // read the header
        this.header = this.reader.header;
        this.dimensions = this.reader.dimensions;
        this.variables = this.reader.variables;
        this.timeArray = this.reader.getDataVariable(variables.TIME);
        this.depthArray = this.reader.getDataVariable(variables.DEPTH);
    }

    get3DVariable (variable, time, depth) {
        let colSize = this.dimensions.find(dim => dim.name === dimensions.Y).size;
        let rowSize = this.dimensions.find(dim => dim.name === dimensions.X).size;
        let depthSize = this.dimensions.find(dim => dim.name === dimensions.Z).size;
        let size = colSize * rowSize;

        let timeIndex = utils.getIndexFromValue(this.timeArray, dateUtils.transformDate(time));
        let depthIndex = utils.getIndexFromValue(this.depthArray, Math.abs(depth) * -1);
        let startIndex = timeIndex * size * depthSize + depthIndex * size;

        let result = this.reader.getDataVariableSlice(variable, startIndex, size);

        logger.info(`Retrieve ${variable} data from time index ${timeIndex} and depth index ${depthIndex} (initial index = 0) on a 2D array of size ${rowSize}x${colSize}`);

        return utils.to2DArray(result, colSize, rowSize);
    }

    get2DVariable (variable, time) {
        let colSize = this.dimensions.find(dim => dim.name === dimensions.Y).size;
        let rowSize = this.dimensions.find(dim => dim.name === dimensions.X).size;
        let size = colSize * rowSize;

        let timeIndex = utils.getIndexFromValue(this.timeArray, dateUtils.transformDate(time));
        let startIndex = timeIndex * size;

        let result = this.reader.getDataVariableSlice(variable, startIndex, size);

        logger.info(`Retrieve ${variable} data from time index ${timeIndex} (initial index = 0) on a 2D array of size ${rowSize}x${colSize}`);

        return utils.to2DArray(result, colSize, rowSize);
    }
}

module.exports = MeteolakesFile;
