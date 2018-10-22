'use-strict';

const MeteolakesFile = require('MeteolakesFile');
const variables = require('enum/variables');
const utils = require('utils');

function getVariable (lake, variable, time, depth) {
    let properties = checkProperties(variable, time, depth);

    const file = new MeteolakesFile(utils.getFilePath(lake, properties.time));

    return file.getVariable(properties.variable, properties.time, properties.depth);
}

function getValue (lake, variable, time, depth, x, y) {
    let properties = checkProperties(variable, time, depth);
    let coordinates = checkCoordinates(x, y);

    const file = new MeteolakesFile(utils.getFilePath(lake, properties.time));

    return file.getValue(properties.variable, properties.time, properties.depth, coordinates.x, coordinates.y);
}

function checkProperties (variable, time, depth) {
    time = parseFloat(time);
    utils.meteolakesError(isNaN(time), 'invalid time argument');

    variable = variables[variable.toUpperCase()];
    if (!variable) { utils.meteolakesError(true, 'invalid variable argument'); }

    if (variable === variables.TEMPERATURE || variable === variables.HORIZONTAL_VELOCITY ||
        variable === variables.VERTICAL_VELOCITY) {
        utils.meteolakesError(!depth, `variable ${variable} requires depth value`);
    }

    if (depth) {
        depth = parseFloat(depth);
        utils.meteolakesError(isNaN(depth), 'invalid depth argument');
    }

    return { variable, time, depth };
}

function checkCoordinates (x, y) {
    x = parseFloat(x);
    utils.meteolakesError(isNaN(x), 'invalid x argument');

    y = parseFloat(y);
    utils.meteolakesError(isNaN(y), 'invalid y argument');

    return { x, y };
}

module.exports.getVariable = getVariable;
module.exports.getValue = getValue;
