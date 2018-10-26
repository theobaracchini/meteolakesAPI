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

    test('should retrieve data of a given variable, depth and position on a specified time interval with proper format', () => {
        let result = file.getTable(532830, 144660, 'R1', 1539561600000, 1539594000000, 150);
        let expected = [['depth\\time', '15/10/2018 00:00', '15/10/2018 03:00', '15/10/2018 06:00', '15/10/2018 09:00'],
            ['-150.4', '5.4538e+0', '5.4525e+0', '5.4333e+0', '5.4398e+0']];

        expect(result).toEqual(expected);
    });

    // test('should retrieve velocity data of a given depth and position on a specified time interval with proper format', () => {
    //     let result = file.getTable(532830, 144660, 'velocity', 1539561600000, 1539594000000, 150);
    //     let expected = [['depth\\time', '15/10/2018 00:00', '15/10/2018 03:00', '15/10/2018 06:00', '15/10/2018 09:00'],
    //         ['-150.4', '(???, ???)', '(???, ???)', '(???, ???)', '(???, ???)']];

    //     expect(result).toEqual(expected);
    // });

    test('should retrieve data of a given variable and position on a specified time interval over all depths with proper format', () => {
        let result = file.getTable(532830, 144660, 'R1', 1539572400000, 1539583200000, 'all');
        let expectedLabelLine = ['depth\\time', '15/10/2018 03:00', '15/10/2018 06:00'];
        let expectedFirstLine = ['-307.0', '5.1550e+0', '5.1550e+0'];
        let expectedLine12 = ['-150.4', '5.4525e+0', '5.4333e+0'];
        let expectedLastLine = ['-0.6', '1.6121e+1', '1.6073e+1'];

        expect(result.length).toBe(59 + 1); // with label row
        expect(result[0].length).toBe(2 + 1); // with label column
        expect(result[0]).toEqual(expectedLabelLine);
        expect(result[1]).toEqual(expectedFirstLine);
        expect(result[12]).toEqual(expectedLine12);
        expect(result[59]).toEqual(expectedLastLine);
    });

    test('should retrieve a given value of a given variable and position on a specified time interval with proper format', () => {
        let result = file.getTable(549315, 147210, 'S1', 1539561600000, 1539583200000);
        let expected = [['depth\\time', '15/10/2018 00:00', '15/10/2018 03:00', '15/10/2018 06:00'],
            ['/', '1.1002e+0', '1.0994e+0', '1.1008e+0']];

        expect(result).toEqual(expected);
    });
});
