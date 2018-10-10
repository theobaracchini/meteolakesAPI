'use strict';

const fs = require('fs');
const NetCDFReader = require('../netcdfjs');

//const data = fs.readFileSync('geneva_2018_week30.nc');

class NetCDFFile {

	constructor(url){
		var start = Date.now();
		const data = fs.readFileSync(url);
		this.reader = new NetCDFReader(data); // read the header
		this.header = this.reader.header
		this.dimensions = this.reader.dimensions
		this.variables = this.reader.variables
		var stop = Date.now();
		console.log("Initialization in " + (stop - start) + "ms");
	}

	getDataByTime(variableName, timeValue){
		var start = Date.now();
		var selectedVariable = this.reader.header.variables.find(variable => variable.name === variableName);
		var timeIndex = timeValue - 1;
		var totalElements = selectedVariable.dimensions.reduce((acc, val, idx) => {
			var dimension = this.dimensions[val];
			return (dimension.name !== 'time') ? acc *= dimension.size : acc;
		}, 1);
		console.log(totalElements);
		var colSize = this.dimensions.find(dim => dim.name === 'N').size;
		var rowSize = this.dimensions.find(dim => dim.name === 'M').size;
		console.log(selectedVariable);
		this.record = this.reader.getDataVariable(variableName, timeIndex*totalElements, colSize*rowSize);
		var stop = Date.now();
		console.log("Array[" + this.record.length + "] downloaded in " + (stop - start) + "ms");

		return this.record;
		//return this.to2indicesArray(this.record.slice(timeIndex*totalElements, (timeIndex+1)*totalElements), colSize, rowSize);
	}

	getDataByTimeOld(variableName, timeValue){
		var start = Date.now();
		var selectedVariable = this.reader.header.variables.find(variable => variable.name === variableName);
		var timeIndex = timeValue - 1;
		var totalElements = selectedVariable.dimensions.reduce((acc, val, idx) => {
			var dimension = this.dimensions[val];
			return (dimension.name !== 'time') ? acc *= dimension.size : acc;
		}, 1);
		console.log(totalElements);
		var colSize = this.dimensions.find(dim => dim.name === 'N').size;
		var rowSize = this.dimensions.find(dim => dim.name === 'M').size;
		console.log(selectedVariable);
		this.record = this.reader.getDataVariable(variableName);
		var stop = Date.now();
		console.log("Array[" + this.record.length + "] downloaded in " + (stop - start) + "ms");

		//return this.record;
		return this.to2indicesArray(this.record.slice(timeIndex*totalElements, (timeIndex+1)*totalElements), colSize, rowSize);
	}
	// CARREFUL WITH DIMENSION ORDER!!! LAST ONE FIRST! IN THIS CASE COLUMN FIRST. THERFORE YOU NEED TO MAKE M(182) ARRAYS OF N(36) VALUES
	// FILTER FUNCTION identify if it is 2D or 1D (take the last or the two last dimensions to display), then indicate the index of the other dimensions 
	// (taken in order from last to first), if not inidcated, use index 0

	to2indicesArray(array, colSize, rowSize){
		var start = Date.now();
		var result = [];
		console.log(array.length + " Col: " + colSize + " Row: " + rowSize);
		for(var rowPosition = 0; rowPosition < rowSize; rowPosition++){
			for(var colPosition = 0; colPosition < colSize; colPosition++){
				if (rowPosition === 0) { result.push([]); }
				result[colPosition][rowPosition] = array[colPosition + rowPosition*colSize];
			}
		}
		var stop = Date.now();
		console.log("Length: " + result.length + " in " + (stop - start) + "ms");
		return result;
	}
}

module.exports = NetCDFFile;