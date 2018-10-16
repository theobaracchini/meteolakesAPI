'use-strict';

const dateUtils = require('./date');

function meteolakesError (statement, reason) {
    if (statement) {
        throw new TypeError('Error occured during Meteolakes API call: ' + reason);
    }
}

function to2DArray (array, colSize, rowSize) {
    let result = [];
    for (let rowPosition = 0; rowPosition < rowSize; rowPosition++) {
        for (let colPosition = 0; colPosition < colSize; colPosition++) {
            if (rowPosition === 0) { result.push([]); }
            result[colPosition][rowPosition] = array[colPosition + rowPosition * colSize];
        }
    }
    return result;
}

function getIndexFromValue (array, value) {
    // divide and conquer
    let currentMinIndex = 0;
    let currentMaxIndex = array.length - 1;
    let middleIndex = Math.floor(array.length / 2);

    while (currentMaxIndex - currentMinIndex > 1) {
        if (array[middleIndex] < value) {
            currentMinIndex = middleIndex;
        } else {
            currentMaxIndex = middleIndex;
        }

        middleIndex = Math.floor((currentMaxIndex - currentMinIndex) / 2) + currentMinIndex;
    }

    if (Math.abs(value - array[currentMinIndex]) < Math.abs(value - array[currentMaxIndex])) {
        return currentMinIndex;
    } else {
        return currentMaxIndex;
    }
}

function getFilePath (lake, time) {
    let path = '';
    const date = new Date(Number.parseFloat(time));
    const dateDetails = dateUtils.getDateDetails(date);
    let year = dateDetails.year;
    let week = dateDetails.week;
    let filename = `${lake}_${year}_week${week}.nc`;

    if (lake === 'geneva') {
        path = `../data/${year}/netcdf/${filename}`;
    } else {
        path = `../data_${lake}/${year}/netcdf/${filename}`;
    }

    return path;
}

module.exports.meteolakesError = meteolakesError;
module.exports.to2DArray = to2DArray;
module.exports.getIndexFromValue = getIndexFromValue;
module.exports.getFilePath = getFilePath;
