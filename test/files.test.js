'use-strict';

const MeteolakesFile = require('meteolakesFile');
const path = require('path');

let file = null;

beforeAll(() => {
    file = new MeteolakesFile(path.join('test', 'files', 'geneva_2018_week39.nc'));
});

describe('meteolakesFile module', () => {
    test('should retrieve a given variable data a specific time and specific depth', () => {
        let result = file.getVariable('R1', 1539572400000, 200);

        expect(result.length).toBe(36);
        expect(result[0].length).toBe(182);
        expect(result[0][0]).toBe(NaN);
        expect(result[18][114]).toBe('5.2721e+0');
        expect(result[27][124]).toBe('5.3084e+0');
    });

    test('should retrieve a given variable data a specific time', () => {
        let result = file.getVariable('S1', 1539594000000);

        expect(result.length).toBe(36);
        expect(result[0].length).toBe(182);
        expect(result[0][0]).toBe('0.0000e+0');
        expect(result[18][74]).toBe('1.0933e+0');
        expect(result[24][180]).toBe('1.1015e+0');
    });

    test('should retrieve data of a given variable, depth and position on a specified time interval', () => {
        let result = file.getValue(532830, 144660, 'R1', 1539561600000, 1539594000000, 150);
        let expected = [['5.4538e+0', '5.4525e+0', '5.4333e+0', '5.4398e+0']];

        expect(result).toEqual(expected);
    });

    test('should retrieve data of a given variable and position on a specified time interval over all depths', () => {
        let result = file.getValue(532830, 144660, 'R1', 1539572400000, 1539583200000, 'all');
        let expectedFirstLine = ['5.1550e+0', '5.1550e+0'];
        let expectedLine12 = ['5.4525e+0', '5.4333e+0'];
        let expectedLastLine = ['1.6121e+1', '1.6073e+1'];

        expect(result.length).toBe(59);
        expect(result[0].length).toBe(2);
        expect(result[0]).toEqual(expectedFirstLine);
        expect(result[11]).toEqual(expectedLine12);
        expect(result[58]).toEqual(expectedLastLine);
    });

    test('should retrieve a given value of a given variable and position on a specified time interval', () => {
        let result = file.getValue(549315, 147210, 'S1', 1539561600000, 1539583200000);
        let expected = [['1.1002e+0', '1.0994e+0', '1.1008e+0']];

        expect(result).toEqual(expected);
    });
});
