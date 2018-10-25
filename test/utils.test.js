'use-strict';

const path = require('path');
const utils = require('utils');
const dateUtils = require('date');

describe('utils module', () => {
    test('should throw an error if predicate is true', () => {
        expect(function () {
            utils.meteolakesError(true, 'test');
        }).toThrow();
    });

    test('shouldn\'t throw an error if predicate is false', () => {
        expect(function () {
            utils.meteolakesError(false, 'test');
        }).not.toThrow();
    });

    test('should convert a 1 dimentional array into a 2 dimentional array', () => {
        let init = [-999, 10935.8492, -999, 3234568.76, 4123.456767, 5, 6.345623, 7, -999];
        let expected = [[NaN, '3.2346e+6', '6.3456e+0'], ['1.0936e+4', '4.1235e+3', '7.0000e+0'], [NaN, '5.0000e+0', NaN]];

        expect(utils.formatTable(init, 3, 3)).toEqual(expected);
    });

    test('should find index of the closest value in an ordered array', () => {
        let array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 14, 16, 30, 45, 46, 47, 50];
        let value = 20;
        let expected = 10;

        expect(utils.getIndexFromValue(array, value)).toBe(expected);
    });

    test('should find file path if it\'s geneva lake', () => {
        let lake = 'geneva';
        let time = 1532314800000;
        let baseDir = path.dirname(path.dirname(__dirname));
        let expected = path.join(baseDir, 'data', '2018', 'netcdf', 'geneva_2018_week30.nc');

        expect(utils.getFilePath(lake, time)).toBe(expected);
    });

    test('should find file path if it\'s any other lake', () => {
        let lake = 'greifen';
        let time = 1492293600000;
        let baseDir = path.dirname(path.dirname(__dirname));
        let expected = path.join(baseDir, 'data_greifen', '2017', 'netcdf', 'greifen_2017_week15.nc');

        expect(utils.getFilePath(lake, time)).toBe(expected);
    });

    test('should find coordinate indexes of a given (x, y) point', () => {
        let longitudeCor = [[0, 0, 0, 0, 0, 119799.4, 119872.8, 119945.7, 120018.6, 120092.1, 120166.8, 120243.3, 120321.7, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 120141.8, 120220.3, 120298.2, 120376.1, 120454.5, 120534.2, 120615.8, 120699.2, 0, 0, 0, 0, 0]];
        let latitudeCor = [[0, 0, 0, 0, 0, 502630.2, 502290.1, 501935.7, 501581.3, 501220.6, 500851.7, 500475.4, 500099.22, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 502686.4, 502336.3, 501986.2, 501632.5, 501272.5, 500904.6, 500529.6, 500154.7, 0, 0, 0, 0, 0]];
        let y = 120080;
        let x = 501220;
        let expected = { M: 9, N: 0 };

        expect(utils.getCoordinatesIndex(latitudeCor, longitudeCor, x, y)).toEqual(expected);
    });
});

describe('date module', () => {
    test('should convert a unix timestamp into a matlab timestamp', () => {
        let init = 0;
        let expected = 719529;

        expect(dateUtils.transformDate(init)).toBe(expected);
    });

    describe('should find week number', () => {
        test('for a general case', () => {
            let date = new Date(Date.UTC(2008, 8, 26));
            let expected = { week: 39, year: 2008 };

            expect(dateUtils.getDateDetails(date)).toEqual(expected);
        });

        test('for a specific case', () => {
            let date = new Date(1532314800000);
            let expected = { week: 30, year: 2018 };

            expect(dateUtils.getDateDetails(date)).toEqual(expected);
        });

        test('even if it is the last week of last year', () => {
            let date = new Date(Date.UTC(2016, 0, 2));
            let expected = { week: 53, year: 2015 };

            expect(dateUtils.getDateDetails(date)).toEqual(expected);
        });

        test('even if it is the first week of next year', () => {
            let date = new Date(Date.UTC(2014, 11, 30));
            let expected = { week: 1, year: 2015 };

            expect(dateUtils.getDateDetails(date)).toEqual(expected);
        });
    });
});
