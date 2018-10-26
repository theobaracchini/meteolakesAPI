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

    test('should convert a 1D array into a 2D array (MxN)', () => {
        let init = [-999, 10935.8492, -999, 3234568.76, 4123.456767, 5, 6.345623, 7, -999];
        let expected = [[NaN, '3.2346e+6', '6.3456e+0'], ['1.0936e+4', '4.1235e+3', '7.0000e+0'], [NaN, '5.0000e+0', NaN]];

        expect(utils.formatTable(3, 3, init)).toEqual(expected);
    });

    test('should convert two 1D array into a 2D array (MxN)', () => {
        let init1 = [-999, 10935.8492, -999, 3234568.76, 4123.456767, 5, 6.345623, 7.256, -999];
        let init2 = [-999, 13652.4562, -999, 3147858.85, 4352.761258, 5.3658, 6.785632, 7, -999];
        let expected = [['(NaN, NaN)', '(3.2346e+6, 3.1479e+6)', '(6.3456e+0, 6.7856e+0)'],
            ['(1.0936e+4, 1.3652e+4)', '(4.1235e+3, 4.3528e+3)', '(7.2560e+0, 7.0000e+0)'],
            ['(NaN, NaN)', '(5.0000e+0, 5.3658e+0)', '(NaN, NaN)']];

        expect(utils.formatTable(3, 3, init1, init2)).toEqual(expected);
    });

    test('should add a 1D array data into a 2D array for the week data (NxM)', () => {
        let init = [[NaN, '1.0936e+4', NaN], ['3.2346e+6', '4.1235e+3', '5.0000e+0'], ['6.3456e+0', '7.0000e+0', NaN]];
        let newData = [-999, 20935.8492, -999, 4234568.76, 5123.456767, 6, 7.345623, 8, -999];
        let expected = [
            [NaN, '1.0936e+4', NaN, NaN, '2.0936e+4', NaN],
            ['3.2346e+6', '4.1235e+3', '5.0000e+0', '4.2346e+6', '5.1235e+3', '6.0000e+0'],
            ['6.3456e+0', '7.0000e+0', NaN, '7.3456e+0', '8.0000e+0', NaN]
        ];

        utils.addToWeekData(init, 3, 3, newData);
        expect(init).toEqual(expected);
    });

    test('should add a 1D array data into a 2D array for the week data (NxM) even if it is empty', () => {
        let init = [];
        let newData = [-999, 10935.8492, -999, 3234568.76, 4123.456767, 5, 6.345623, 7.256, -999];
        let expected = [
            [NaN, '1.0936e+4', NaN],
            ['3.2346e+6', '4.1235e+3', '5.0000e+0'],
            ['6.3456e+0', '7.2560e+0', NaN]
        ];

        utils.addToWeekData(init, 3, 3, newData);
        expect(init).toEqual(expected);
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

        expect(utils.getFilePathFromTime(lake, time)).toBe(expected);
    });

    test('should find file path if it\'s any other lake', () => {
        let lake = 'greifen';
        let time = 1492293600000;
        let baseDir = path.dirname(path.dirname(__dirname));
        let expected = path.join(baseDir, 'data_greifen', '2017', 'netcdf', 'greifen_2017_week15.nc');

        expect(utils.getFilePathFromTime(lake, time)).toBe(expected);
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

    test('should add labels to a table', () => {
        let array = [['a', 'b', 'c', 'd', 'e'], ['f', 'g', 'h', 'i', 'j'], ['k', 'l', 'm', 'n', 'o']];
        let firstRow = ['depth\\time', '1234567', '2345678', '3456789', '4567890', '5678901'];
        let firstCol = [200, 300, 400];
        let expected =
            [['depth\\time', '1234567', '2345678', '3456789', '4567890', '5678901'],
                [200, 'a', 'b', 'c', 'd', 'e'],
                [300, 'f', 'g', 'h', 'i', 'j'],
                [400, 'k', 'l', 'm', 'n', 'o']];

        expect(utils.addLabel(array, firstRow, firstCol)).toEqual(expected);
    });

    test('should parse a number', () => {
        let value = '123.543';
        let expected = 123.543;

        expect(utils.verifyNumber(value)).toBe(expected);
    });

    test('should be able to parse 0', () => {
        let value = '0.0000e0';
        let expected = 0;

        expect(utils.verifyNumber(value)).toBe(expected);
    });

    test('should return an error when trying to parse something else than a number with function verifyNumber', () => {
        let value = 'this is not a number';
        expect(function () {
            utils.verifyNumber(value);
        }).toThrow('Error occured during Meteolakes API call: invalid argument');
    });

    test('should create a depth array', () => {
        let expected = [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200];
        expect(utils.createDepthArray(200, 12)).toEqual(expected);
    });

    test('should create a depth array even with no value', () => {
        let expected = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        expect(utils.createDepthArray(undefined, 12)).toEqual(expected);
    });
});

describe('date module', () => {
    test('should convert a unix timestamp into a matlab timestamp', () => {
        let init = 0;
        let expected = 719529;

        expect(dateUtils.transformDate(init)).toBe(expected);
    });

    test('should convert a matlab timestamp into a unix timestamp', () => {
        let init = 719529;
        let expected = 0;

        expect(dateUtils.getJsTimestamp(init)).toBe(expected);
    });

    test('should create a time label array', () => {
        let timeArray = [737342, 737342.125, 737342.25, 737342.375];
        let expected = ['depth\\time', '09/10/2018 03:00', '09/10/2018 06:00'];

        expect(dateUtils.getTimeLabel(timeArray, 1, 2)).toEqual(expected);
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
