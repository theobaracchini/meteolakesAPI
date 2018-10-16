'use-strict';

const utils = require('../src/utils');
const dateUtils = require('../src/date');

describe('utils module', () => {
    test('should convert a 1 dimentional array into a 2 dimentional array', () => {
        let init = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        let expected = [[0, 3, 6], [1, 4, 7], [2, 5, 8]];

        expect(utils.to2DArray(init, 3, 3)).toEqual(expected);
    });

    test('should find index of the closest value in an ordered array', () => {
        let array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 14, 16, 30, 45, 46, 47, 50];
        let value = 20;
        let expected = 10;

        expect(utils.getIndexFromValue(array, value)).toBe(expected);
    });

    test('should find file path', () => {
        let lake = 'geneva';
        let time = 1532314800000;
        let expected = '../data/2018/netcdf/geneva_2018_week30.nc';

        expect(utils.getFilePath(lake, time)).toBe(expected);
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
