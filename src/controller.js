'use-strict';

const MeteolakesFile = require('MeteolakesFile');
const variables = require('enum/variables');
const utils = require('utils');

function getVariable (lake, variable, time, depth) {
    time = parseFloat(time);
    utils.meteolakesError(isNaN(time), 'invalid time argument');

    variable = variables[variable.toUpperCase()];
    if (!variable) { utils.meteolakesError(true, 'invalid variable argument'); }

    if (depth) {
        depth = parseFloat(depth);
        utils.meteolakesError(isNaN(depth), 'invalid depth argument');
    }

    const file = new MeteolakesFile(utils.getFilePath(lake, time));

    return file.getVariable(variable, time, depth);
}

module.exports.getVariable = getVariable;
