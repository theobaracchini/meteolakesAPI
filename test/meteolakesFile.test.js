const utils = require('../src/utils');

test('should convert a 1 dimentional array into a 2 dimentional array', () => {
	let init = [0, 1, 2, 3, 4, 5, 6, 7, 8];
	let expected = [[0, 3, 6], [1, 4, 7], [2, 5, 8]];
  	
  	expect(utils.to2DArray(init, 3, 3)).toEqual(expected);
});