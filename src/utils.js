'use-strict';

const dateUtils = require('date');
const path = require('path');

const MAX_DISTANCE = 1000;

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

function getCoordinatesIndex (xArray, yArray, x, y) {
    let maxN = xArray.length;
    let maxM = xArray[0].length;
    let minDistance = Number.MAX_VALUE;
    let finalM = -1;
    let finalN = -1;

    meteolakesError(xArray.length === yArray.length &&
        xArray[0][0] && yArray[0][0] &&
        xArray[0].length === yArray[0].length, 'invalid coordinates array');

    for (let m = 0; m < maxM; m++) {
        for (let n = 0; n < maxN; n++) {
            let distance = Math.pow(x - xArray[n][m], 2) + Math.pow(y - yArray[n][m], 2);

            if (distance < minDistance) {
                minDistance = distance;
                finalM = m;
                finalN = n;
            }
        }
    }

    meteolakesError(minDistance > MAX_DISTANCE, 'specified coordinates outside the lake');

    return { M: finalM, N: finalN };
}

function getFilePath (lake, time) {
    let filePath = '';
    let basePath = path.dirname(path.dirname(__dirname));
    const date = new Date(Number.parseFloat(time));
    const dateDetails = dateUtils.getDateDetails(date);
    let year = dateDetails.year;
    let week = dateDetails.week;
    let filename = `${lake}_${year}_week${week}.nc`;

    if (lake === 'geneva') {
        filePath = path.join(basePath, 'data', year.toString(), 'netcdf', filename);
    } else {
        filePath = path.join(basePath, `data_${lake}`, year.toString(), 'netcdf', filename);
    }

    return filePath;
}

module.exports.meteolakesError = meteolakesError;
module.exports.to2DArray = to2DArray;
module.exports.getIndexFromValue = getIndexFromValue;
module.exports.getFilePath = getFilePath;
module.exports.getCoordinatesIndex = getCoordinatesIndex;
