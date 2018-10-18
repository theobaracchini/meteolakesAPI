'use-strict';

const MeteolakesFile = require('MeteolakesFile');
const variables = require('enum/variables');
const utils = require('utils');

function getVariable (lake, variable, time, depth) {
    const file = new MeteolakesFile(utils.getFilePath(lake, time));
    variable = variables[variable.toUpperCase()];

    if (!variable) { utils.meteolakesError(true, 'invalid variable argument'); }

    return file.getVariable(variable, time, depth);
}

module.exports.getVariable = getVariable;
