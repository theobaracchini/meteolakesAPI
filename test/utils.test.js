const utils = require('../src/utils');

describe('utils module', () => {
    test('should convert a 1 dimentional array into a 2 dimentional array', () => {
        let init = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        let expected = [[0, 3, 6], [1, 4, 7], [2, 5, 8]];

        expect(utils.to2DArray(init, 3, 3)).toEqual(expected);
    });

    test('should convert a unix timestamp into a matlab timestamp', () => {
        let init = 0;
        let expected = 719529;

        expect(utils.transformDate(init)).toBe(expected);
    });

    test('should find index of the closest value in an ordered array', () => {
        let array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 14, 16, 30, 45, 46, 47, 50];
        let value = 20;
        let expected = 10;

        expect(utils.getIndexFromValue(array, value)).toBe(expected);
    });
});
