'use strict';

const fs = require('fs');
const NetCDFReader = require('../../netcdfjs');
const dimensions = require('./enum/dimensions');
const variables = require('./enum/variables');

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
        var colSize = this.dimensions.find(dim => dim.name === dimensions.Y).size;
        var rowSize = this.dimensions.find(dim => dim.name === dimensions.X).size;
        var depthSize = this.dimensions.find(dim => dim.name === dimensions.Z).size;
        var size = colSize * rowSize;
        var startIndex = this.getTimeIndex(time) * size * depthSize + this.getDepthIndex(depth) * size;
        var result = this.reader.getDataVariableSlice(variable, startIndex, size);
        return this.to2indicesArray(result, colSize, rowSize);
    }

    get2DVariable (variable, time) {
        var colSize = this.dimensions.find(dim => dim.name === dimensions.Y).size;
        var rowSize = this.dimensions.find(dim => dim.name === dimensions.X).size;
        var size = colSize * rowSize;
        var startIndex = this.getTimeIndex(time) * size;
        var result = this.reader.getDataVariableSlice(variable, startIndex, size);
        return this.to2indicesArray(result, colSize, rowSize);
    }

    getTimeIndex (time) {
        /* TODO How to transform the time value into DateTime
        var date = new Date(2018, 6, 25, 10)
        console.log(date.getTime());
        console.log(date.toDateString());
        console.log(this.timeArray); */
        return 0;
    }

    getDepthIndex (depth) {
        depth = Math.abs(depth) * -1;

        // divide and conquer
        var currentMinIndex = 0;
        var currentMaxIndex = this.depthArray.length - 1;
        var middleIndex = Math.floor(this.depthArray.length / 2);

        while (currentMaxIndex - currentMinIndex > 1) {
            if (this.depthArray[middleIndex] < depth) {
                currentMinIndex = middleIndex;
            } else {
                currentMaxIndex = middleIndex;
            }

            middleIndex = Math.floor((currentMaxIndex - currentMinIndex) / 2) + currentMinIndex;
        }

        if (Math.abs(depth - this.depthArray[currentMinIndex]) < Math.abs(depth - this.depthArray[currentMaxIndex])) {
            return currentMinIndex;
        } else {
            return currentMaxIndex;
        }
    }

    to2indicesArray (array, colSize, rowSize) {
        var result = [];
        for (var rowPosition = 0; rowPosition < rowSize; rowPosition++) {
            for (var colPosition = 0; colPosition < colSize; colPosition++) {
                if (rowPosition === 0) { result.push([]); }
                result[colPosition][rowPosition] = array[colPosition + rowPosition * colSize];
            }
        }
        return result;
    }
}

module.exports = MeteolakesFile;
