'use-strict';

const app = require('app');
const request = require('supertest');
const csvParser = require('papaparse');
// const logger = require('logger').logger;

describe('MeteolakesAPI', () => {
    test('should GET /api/:lake/:variable/:time/:depth', () => {
        return request(app)
            .get('/api/geneva/temperature/1532314800000/200')
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.header['content-length']).toBe('51308');
                expect(response.header['content-type']).toBe('text/csv; charset=utf-8');

                let result = csvParser.parse(response.text).data;
                expect(result.length).toBe(36 + 1); // there is one empty line at the end of the file, thus the array.
                expect(result[0].length).toBe(182);
                expect(result[0][0]).toBe('-999');
                expect(result[17][111]).toBe('5.2369489669799805');
                expect(result[25][164]).toBe('5.292830944061279');
            });
    });

    test('should GET /api/:lake/:variable/:time', () => {
        return request(app)
            .get('/api/geneva/water_level/1532325600000')
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.header['content-length']).toBe('70705');
                expect(response.header['content-type']).toBe('text/csv; charset=utf-8');

                let result = csvParser.parse(response.text).data;
                expect(result.length).toBe(36 + 1); // there is one empty line at the end of the file, thus the array.
                expect(result[0].length).toBe(182);
                expect(result[0][0]).toBe('0');
                expect(result[29][70]).toBe('0.7508849501609802');
                expect(result[8][145]).toBe('0.7336804866790771');
            });
    });

    test('should not work with an invalid variable name', () => {
        return request(app)
            .get('/api/geneva/wrong_variable/1532325600000')
            .expect(400)
            .expect('Error occured during Meteolakes API call: invalid variable argument');
    });

    test('should not work with an invalid lake name', () => {
        return request(app)
            .get('/api/lake/water_level/1532325600000')
            .expect(400)
            .expect('Error occured during Meteolakes API call: ENOENT: no such file or directory, open \'D:\\Dan\\workspace\\data_lake\\2018\\netcdf\\lake_2018_week30.nc\'');
    });

    test('should not work with an invalid timestamp', () => {
        return request(app)
            .get('/api/geneva/water_level/timestamp')
            .expect(400)
            .expect('Error occured during Meteolakes API call: invalid time argument');
    });

    test('should not work with a too big or too small timestamp', () => {
        return request(app)
            .get('/api/geneva/water_level/123456789')
            .expect(400)
            .expect('Error occured during Meteolakes API call: ENOENT: no such file or directory, open \'D:\\Dan\\workspace\\data\\1970\\netcdf\\geneva_1970_week1.nc\'');
    });

    test('should not work with an invalid depth', () => {
        return request(app)
            .get('/api/geneva/temperature/1532325600000/depth')
            .expect(400)
            .expect('Error occured during Meteolakes API call: invalid depth argument');
    });
});
