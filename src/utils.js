'use-strict'

function meteolakesError(statement, reason) {
    if (statement) {
        throw new TypeError('Error occured during Meteolakes API call: ' + reason);
    }
}

module.exports.meteolakesError = meteolakesError;