'use-strict';

const MILISECONDS_IN_DAY = 86400000;
const JSZERO = 719529;

function transformDate (jsTimestamp) {
    return jsTimestamp / MILISECONDS_IN_DAY + JSZERO;
}

function getJsTimestamp (matlabTimestamp) {
    return (matlabTimestamp - JSZERO) * MILISECONDS_IN_DAY;
}

function getDateDetails (date) {
        // Copy date so don't modify original
        date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7));
        // Get first day of year
        var yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
        // Calculate full weeks to nearest Thursday
        var weekNo = Math.ceil(( ( (date - yearStart) / 86400000) + 1)/7);
        // Return array of year and week number
    return {
        week: weekNo,
        year: date.getUTCFullYear()
    };
}

function addWeek(dateDetails) {
    if(dateDetails.week === getLastWeekOfYear(dateDetails.year)) {
        return {
            week: 1,
            year: dateDetails.year + 1
        };
    }
    return {
        week: dateDetails.week + 1,
        year: dateDetails.year
    };
}

function getLastWeekOfYear(year) {
    return getDateDetails(new Date(`12/28/${year}`)).week;
}

function compare(dateDetails1, dateDetails2) {
    if(dateDetails1.year < dateDetails2.year) {
        return -1;
    }
    if(dateDetails1.year > dateDetails2.year) {
        return 1;
    }
    // At this point years are equal
    if(dateDetails1.week < dateDetails2.week) {
        return -1;
    }
    if(dateDetails1.week > dateDetails2.week) {
        return 1;
    }
    // At this point dates are equal
    return 0;
}

function findSunday (date) {
    const weekday = date.getUTCDay() ? date.getUTCDay() : 7;
    const diff = 7 - weekday;
    return new Date(date.getTime() + diff * MILISECONDS_IN_DAY);
}

function getTimeLabel (timeArray, startIndex, endIndex) {
    return ['depth\\time',
        ...timeArray.slice(startIndex, endIndex + 1)
            .map(d => {
                let date = new Date(getJsTimestamp(d));
                let day = formatDigit(date.getUTCDate());
                let month = formatDigit(date.getUTCMonth() + 1);
                let year = date.getUTCFullYear();
                let hours = formatDigit(date.getUTCHours());
                let minutes = formatDigit(date.getUTCMinutes());

                return `${day}/${month}/${year} ${hours}:${minutes}`;
            })];
}

function formatDigit (value) {
    return value < 10 ? '0' + value : value;
}

module.exports.transformDate = transformDate;
module.exports.getJsTimestamp = getJsTimestamp;
module.exports.getDateDetails = getDateDetails;
module.exports.getTimeLabel = getTimeLabel;
module.exports.compare = compare;
module.exports.addWeek = addWeek;
