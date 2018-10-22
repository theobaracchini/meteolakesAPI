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
        expect(result[0][0]).toBe(-999);
        expect(result[18][114]).toBe(5.272083759307861);
        expect(result[27][124]).toBe(5.308399200439453);
    });

    test('should retrieve a given variable data a specific time', () => {
        let result = file.getVariable('S1', 1539594000000);

        expect(result.length).toBe(36);
        expect(result[0].length).toBe(182);
        expect(result[0][0]).toBe(0);
        expect(result[18][74]).toBe(1.0933171510696411);
        expect(result[24][180]).toBe(1.101495385169983);
    });

    test('should retrieve a given value of a given variable, time, depth and position', () => {
        let result = file.getValue('R1', 1539583200000, 150, 532830, 144660);

        expect(result).toEqual([5.433284282684326]);
    });

    test('should retrieve a given value of a given variable, time and position', () => {
        let result = file.getValue('S1', 1539561600000, null, 549315, 147210);

        expect(result).toEqual([1.1001896858215332]);
    });
});
