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
