'use-strict';

const logger = require('logger').logger;

describe('logger module', () => {
    test('should have level info', () => {
        expect(logger.level).toBe('info');
    });
    test('should have one transport', () => {
        expect(logger.transports.length).toBe(1);
    });
});
