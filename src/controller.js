'use-strict';

const MeteolakesFile = require('MeteolakesFile');
const variables = require('enum/variables');
const utils = require('utils');
const date = require('date');

function getLayer (lake, variable, time, depth) {
    let properties = checkProperties(variable, time, depth);

    const file = new MeteolakesFile(utils.getFilePath(lake, properties.time));

    return file.getLayer(properties.variable, properties.time, properties.depth);
}

function getTableFromCoordinates (x, y, lake, variable, startTime, endTime, depth) {
    let properties = checkProperties(variable, null, depth);
    let time = checkTime(startTime, endTime);
    let coordinates = checkCoordinates(x, y);

    const file = new MeteolakesFile(utils.getFilePath(lake, time.start));

    return file.getTable(coordinates.x, coordinates.y, properties.variable, time.start, time.end, properties.depth);
}

function checkProperties (variable, time, depth) {
    variable = variables[variable.toUpperCase()];
    utils.meteolakesError(!variable, 'invalid variable argument');

    if (time) {
        time = parseFloat(time);
        utils.meteolakesError(isNaN(time), 'invalid time argument');
    }

    if (depth) {
        depth = parseFloat(depth);
        utils.meteolakesError(isNaN(depth), 'invalid depth argument');
    }

    if (!time && !depth) {
        depth = 'all';
    }

    if (variable === variables.TEMPERATURE || variable === variables.HORIZONTAL_VELOCITY ||
        variable === variables.VERTICAL_VELOCITY || variable === variables.VELOCITY) {
        utils.meteolakesError(!depth, `variable ${variable} requires depth value`);
    }

    return { variable, time, depth };
}

function checkTime (start, end) {
    start = parseFloat(start);
    utils.meteolakesError(isNaN(start), 'invalid start time argument');
    end = parseFloat(end);
    utils.meteolakesError(isNaN(end), 'invalid end time argument');

    // check if the time belong to the same week
    let startDateInfo = date.getDateDetails(new Date(start));
    let endDateInfo = date.getDateDetails(new Date(end));
    let checkError = startDateInfo.week !== endDateInfo.week || startDateInfo.year !== endDateInfo.year;
    utils.meteolakesError(checkError, 'start time and end time do not belong to the same week');

    return { start, end };
}

function checkCoordinates (x, y) {
    x = parseFloat(x);
    utils.meteolakesError(isNaN(x), 'invalid x argument');

    y = parseFloat(y);
    utils.meteolakesError(isNaN(y), 'invalid y argument');

    return { x, y };
}

module.exports.getLayer = getLayer;
module.exports.getTableFromCoordinates = getTableFromCoordinates;
