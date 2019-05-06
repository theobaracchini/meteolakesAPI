'use-strict';

const MeteolakesFile = require('MeteolakesFile');
const variables = require('enum/variables');
const utils = require('utils');
const date = require('date');
const logger = require('logger').logger;

function getLayer (lake, variable, time, depth) {
    let properties = checkProperties(variable, time, depth);

    const file = new MeteolakesFile(utils.getFilePathFromTime(lake, properties.time));

    return file.getLayer(properties.variable, properties.time, properties.depth);
}


function getTableFromCoordinates (x, y, lake, variable, startTime, endTime, depth, includeRange = false) {
    let properties = checkProperties(variable, null, depth);
    let time = checkTime(startTime, endTime);
    let coordinates = checkCoordinates(x, y);

    const startDateInfo = date.getDateDetails(new Date(parseFloat(startTime)));
    const endDateInfo = date.getDateDetails(new Date(parseFloat(endTime)));
    const weekIni = startDateInfo.week;
	
	var fileTable = [];	
    if (date.compare(startDateInfo, endDateInfo) == 1) {

      let endTime = utils.getDateFromIsoweek(weekIni,startDateInfo.year,8);

      const file = new MeteolakesFile(utils.getFilePathFromTime(lake, time.start));
      fileTable = file.getTable(coordinates.x, coordinates.y, properties.variable, time.start, endTime, properties.depth, includeRange);
      logger.warn('interface between years detected. Please make different requests for different years');

    } else {
        let currentDateInfo = startDateInfo;
        while (date.compare(currentDateInfo, endDateInfo) < 1) {
            let timeWeekIni = utils.getDateFromIsoweek(currentDateInfo.week, currentDateInfo.year,1);
            let timeWeekEnd = utils.getDateFromIsoweek(currentDateInfo.week, currentDateInfo.year,8);
                
            let timeStartWeek = Math.max(startTime,timeWeekIni);
            let timeEndWeek = Math.min(endTime,timeWeekEnd);

            var file = new MeteolakesFile(utils.getFilePathFromTime(lake, timeStartWeek));
            var fileTableSub = file.getTable(coordinates.x, coordinates.y, properties.variable, timeStartWeek, timeEndWeek, properties.depth, includeRange);
                
            if (fileTable.length > 0){
                for (let i = 0; i < fileTable.length; i++) {
                    delete fileTableSub[i][0]
                    let filteredArray = fileTableSub[i].filter(function () { return true });

                    fileTable[i] = fileTable[i].concat(filteredArray);
                }
            } else {
                fileTable = fileTable.concat(fileTableSub);
            }
            currentDateInfo = date.addWeek(currentDateInfo);
        }
	  
    }
    
    return fileTable;
}

function getWeekData (week, year, lake, variable, depth) {
    let properties = checkProperties(variable, null, depth, week, year);

    const file = new MeteolakesFile(utils.getFilePath(lake, year, week));

    return file.getWeekData(properties.variable, properties.depth);
}

function checkProperties (variable, time, depth, week, year) {
    variable = variables[variable.toUpperCase()];
    utils.meteolakesError(!variable, 'invalid variable argument');

    utils.verifyNumber(time, 'time');
    utils.verifyNumber(depth, 'depth');
    utils.verifyNumber(week, 'week number');
    utils.verifyNumber(year, 'year');

    if (!time && !depth && !year && !week) {
        depth = 'all';
    }

    if (variable === variables.TEMPERATURE || variable === variables.HORIZONTAL_VELOCITY ||
        variable === variables.VERTICAL_VELOCITY || variable === variables.VELOCITY) {
        utils.meteolakesError(!depth, `variable ${variable} requires depth value`);
    }

    if (variable === variables.WATER_LEVEL && depth) {
        depth = null;
    }

    return { variable, time, depth, week, year };
}

function checkTime (start, end) {
    start = parseFloat(start);
    utils.meteolakesError(isNaN(start), 'invalid start time argument');
    end = parseFloat(end);
    utils.meteolakesError(isNaN(end), 'invalid end time argument');

    // THEO: the following is not needed with the new multi-week support
    // check if the time belong to the same week
    // let startDateInfo = date.getDateDetails(new Date(start));
    // let endDateInfo = date.getDateDetails(new Date(end));
    // let checkError = startDateInfo.week !== endDateInfo.week || startDateInfo.year !== endDateInfo.year;
    // utils.meteolakesError(checkError, 'start time and end time do not belong to the same week');

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
module.exports.getWeekData = getWeekData;
