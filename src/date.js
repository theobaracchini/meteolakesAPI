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
    let result = {
        week: getWeek(date),
        year: date.getUTCFullYear()
    };

    if (result.week === 0) {
        result.year--;
        result.week = getWeek(new Date(Date.UTC(result.year, 11, 31)));
    } else if (result.week === 53) {
        const sunday = findSunday(date);
        if (sunday.getUTCMonth() === 0 && sunday.getUTCDate() >= 4) {
            result.year++;
            result.week = 1;
        }
    }

    return result;
}

function getWeek (date) {
    // use 7 for Sunday instead of 0.
    const weekday = date.getUTCDay() ? date.getUTCDay() : 7;
    const firstJan = new Date(Date.UTC(date.getUTCFullYear(), 0));
    const ordinalDay = Math.floor((date - firstJan) / MILISECONDS_IN_DAY) + 1;

    return Math.floor((ordinalDay - weekday + 10) / 7);
}

function findSunday (date) {
    const weekday = date.getUTCDay() ? date.getUTCDay() : 7;
    const diff = 7 - weekday;
    return new Date(date.getTime() + diff * MILISECONDS_IN_DAY);
}

module.exports.transformDate = transformDate;
module.exports.getJsTimestamp = getJsTimestamp;
module.exports.getDateDetails = getDateDetails;
