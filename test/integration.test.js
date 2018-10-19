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
});
