'use-strict';

function meteolakesError (statement, reason) {
    if (statement) {
        throw new TypeError('Error occured during Meteolakes API call: ' + reason);
    }
}

function to2DArray (array, colSize, rowSize) {
        var result = [];
        for (var rowPosition = 0; rowPosition < rowSize; rowPosition++) {
            for (var colPosition = 0; colPosition < colSize; colPosition++) {
                if (rowPosition === 0) { result.push([]); }
                result[colPosition][rowPosition] = array[colPosition + rowPosition * colSize];
            }
        }
        return result;
    }

module.exports.meteolakesError = meteolakesError;
module.exports.to2DArray = to2DArray;
