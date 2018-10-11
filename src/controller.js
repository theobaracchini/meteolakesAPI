'use-strict';

const MeteolakesFile = require('./MeteolakesFile');
const variables = require('./enum/variables');
const utils = require('./utils');

function getVariable (variable, time, depth) {
    const file = new MeteolakesFile('../geneva_2018_week30.nc');
    variable = variables[variable.toUpperCase()];

    switch (variable) {
        case variables.TEMPERATURE :
        case variables.HORIZONTAL_VELOCITIY :
        case variables.VERTICAL_VELOCITIY :
            return file.get3DVariable(variable, time, depth);
        case variables.WATER_LEVEL :
            return file.get2DVariable(variable, time);
        default :
            utils.meteolakesError(true, 'invalid variable argument');
    }
}

module.exports.getVariable = getVariable;
