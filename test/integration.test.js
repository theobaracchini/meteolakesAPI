'use-strict';

const app = require('app');
const request = require('supertest');
const csvParser = require('papaparse');
// const logger = require('logger').logger;

describe('MeteolakesAPI', () => {
    test('should GET /api/layer/:lake/:variable/:time/:depth', (done) => {
        request(app)
            .get('/api/layer/geneva/temperature/1532314800000/200')
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.header['content-type']).toBe('text/csv; charset=utf-8');

                let result = csvParser.parse(response.text).data;
                expect(result.length).toBe(36 + 1); // there is one empty line at the end of the file, thus the array.
                expect(result[0].length).toBe(182);
                expect(result[0][0]).toBe('NaN');
                expect(result[17][111]).toBe('5.2369e+0');
                expect(result[25][164]).toBe('5.2928e+0');
                done();
            });
    });

    test('should GET /api/layer/:lake/:variable/:time', (done) => {
        request(app)
            .get('/api/layer/geneva/water_level/1532325600000')
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.header['content-type']).toBe('text/csv; charset=utf-8');

                let result = csvParser.parse(response.text).data;
                expect(result.length).toBe(36 + 1); // there is one empty line at the end of the file, thus the array.
                expect(result[0].length).toBe(182);
                expect(result[0][0]).toBe('0.0000e+0');
                expect(result[29][70]).toBe('7.5088e-1');
                expect(result[8][145]).toBe('7.3368e-1');
                done();
            });
    });

    test('should GET /api/coordinates/:x/:y/:lake/:variable/:startTime/:endTime/:depth', (done) => {
        request(app)
            .get('/api/coordinates/516040/140140/geneva/temperature/1532336400000/1532509200000/100')
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.header['content-type']).toBe('text/csv; charset=utf-8');

                let result = csvParser.parse(response.text).data;
                expect(result.length).toBe(2 + 1); // there is one empty line at the end of the file, thus the array.
                expect(result[0].length).toBe(18);
                expect(result[1][1]).toEqual('5.6386e+0');
                expect(result[1][17]).toEqual('5.6723e+0');
                done();
            });
    });

    test('should GET /api/coordinates/:x/:y/:lake/:variable/:startTime/:endTime/', (done) => {
        request(app)
            .get('/api/coordinates/516040/140140/geneva/temperature/1532509200000/1532682000000')
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.header['content-type']).toBe('text/csv; charset=utf-8');

                let result = csvParser.parse(response.text).data;
                expect(result.length).toBe(60 + 1);
                expect(result[0].length).toBe(18);
                expect(result[1][1]).toEqual('NaN');
                expect(result[17][1]).toEqual('5.6723e+0');
                expect(result[30][16]).toEqual('7.2108e+0');
                expect(result[59][1]).toEqual('2.1798e+1');
                done();
            });
    });

    test('should not work with an invalid variable name', (done) => {
        request(app)
            .get('/api/layer/geneva/wrong_variable/1532325600000')
            .expect(400)
            .expect('Error occured during Meteolakes API call: invalid variable argument')
            .then(() => done());
    });

    test('should not work with an invalid lake name', (done) => {
        request(app)
            .get('/api/layer/lake/water_level/1532325600000')
            .expect(400)
            .expect('Error occured during Meteolakes API call: ENOENT: no such file or directory, open \'D:\\Dan\\workspace\\data_lake\\2018\\netcdf\\lake_2018_week30.nc\'')
            .then(() => done());
    });

    test('should not work with an invalid timestamp', (done) => {
        request(app)
            .get('/api/layer/geneva/water_level/timestamp')
            .expect(400)
            .expect('Error occured during Meteolakes API call: invalid time argument')
            .then(() => done());
    });

    test('should not work with a too big or too small timestamp', (done) => {
        request(app)
            .get('/api/layer/geneva/water_level/123456789')
            .expect(400)
            .expect('Error occured during Meteolakes API call: ENOENT: no such file or directory, open \'D:\\Dan\\workspace\\data\\1970\\netcdf\\geneva_1970_week1.nc\'')
            .then(() => done());
    });

    test('should not work with an invalid depth', (done) => {
        request(app)
            .get('/api/layer/geneva/temperature/1532325600000/depth')
            .expect(400)
            .expect('Error occured during Meteolakes API call: invalid depth argument')
            .then(() => done());
    });

    test('should not work if depth is required', (done) => {
        request(app)
            .get('/api/layer/geneva/temperature/1532325600000')
            .expect(400)
            .expect('Error occured during Meteolakes API call: variable R1 requires depth value')
            .then(() => done());
    });

    test('should not work with invalid x coordinate', (done) => {
        request(app)
            .get('/api/coordinates/x/123456/geneva/water_level/1532325600000/1532325600000')
            .expect(400)
            .expect('Error occured during Meteolakes API call: invalid x argument')
            .then(() => done());
    });

    test('should not work with invalid y coordinate', (done) => {
        request(app)
            .get('/api/coordinates/563241/y/geneva/temperature/1532325600000/1532325600000/200')
            .expect(400)
            .expect('Error occured during Meteolakes API call: invalid y argument')
            .then(() => done());
    });

    test('should not work if coordinates are too far away from the lake', (done) => {
        request(app)
            .get('/api/coordinates/500000/100000/geneva/temperature/1532325600000/1532325600000')
            .expect(400)
            .expect('Error occured during Meteolakes API call: specified coordinates outside the lake')
            .then(() => done());
    });

    test('should not work with invalid start timestamp', (done) => {
        request(app)
            .get('/api/coordinates/516040/140140/geneva/temperature/time/1532682000000')
            .expect(400)
            .expect('Error occured during Meteolakes API call: invalid start time argument')
            .then(() => done());
    });

    test('should not work with invalid start timestamp', (done) => {
        request(app)
            .get('/api/coordinates/516040/140140/geneva/temperature/1532682000000/time')
            .expect(400)
            .expect('Error occured during Meteolakes API call: invalid end time argument')
            .then(() => done());
    });

    test('should not work with two timestamps from different files', (done) => {
        request(app)
            .get('/api/coordinates/516040/140140/geneva/water_level/1532682000000/1532995200000')
            .expect(400)
            .expect('Error occured during Meteolakes API call: start time and end time do not belong to the same week')
            .then(() => done());
    });
});
