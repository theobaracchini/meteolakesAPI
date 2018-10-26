'use-strict';

const dateUtils = require('date');
const path = require('path');
const dataBasePath = require('config/config')().data_path;

const MAX_DISTANCE = 1000;

function meteolakesError (statement, reason) {
    if (statement) {
        throw new TypeError('Error occured during Meteolakes API call: ' + reason);
    }
}

function formatTable (colSize, rowSize, array1, array2) {
    let result = [];
    let value = '';
    for (let rowPosition = 0; rowPosition < rowSize; rowPosition++) {
        for (let colPosition = 0; colPosition < colSize; colPosition++) {
            if (rowPosition === 0) { result.push([]); }
            if (array2) {
                value = `(${formatValue(array1[colPosition + rowPosition * colSize])}, ` +
                    `${formatValue(array2[colPosition + rowPosition * colSize])})`;
            } else {
                value = formatValue(array1[colPosition + rowPosition * colSize]);
            }
            result[colPosition][rowPosition] = value;
        }
    }
    return result;
}

function formatValue (value) {
    if (value === -999) {
        return NaN;
    } else {
        return value.toExponential(4);
    }
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

    meteolakesError(xArray.length !== yArray.length ||
        xArray[0][0] === undefined || yArray[0][0] === undefined ||
        xArray[0].length !== yArray[0].length, 'invalid coordinates array');

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
    const date = new Date(Number.parseFloat(time));
    const dateDetails = dateUtils.getDateDetails(date);
    let year = dateDetails.year;
    let week = dateDetails.week;
    let filename = `${lake}_${year}_week${week}.nc`;

    if (lake === 'geneva') {
        filePath = path.join(dataBasePath, 'data', year.toString(), 'netcdf', filename);
    } else {
        filePath = path.join(dataBasePath, `data_${lake}`, year.toString(), 'netcdf', filename);
    }

    return filePath;
}

function addLabel (table, firstRow, firstCol) {
    let result = [];
    result.push(firstRow);

    for (let i = 0; i < firstCol.length; i++) {
        result.push([firstCol[i], ...table[i]]);
    }

    return result;
}

module.exports.meteolakesError = meteolakesError;
module.exports.formatTable = formatTable;
module.exports.getIndexFromValue = getIndexFromValue;
module.exports.getFilePath = getFilePath;
module.exports.getCoordinatesIndex = getCoordinatesIndex;
module.exports.addLabel = addLabel;
