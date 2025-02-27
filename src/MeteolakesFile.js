'use strict';

const fs = require('fs');
const NetCDFReader = require('../../netcdfjs');
const dimensions = require('enum/dimensions');
const variables = require('enum/variables');
const logger = require('logger').logger;
const utils = require('utils');
const dateUtils = require('date');
const config = require('config/config')();

class MeteolakesFile {
    constructor (path) {
        let data = null;
		
        try {
            data = fs.readFileSync(path);
        } catch (err) {
            utils.meteolakesError(true, err.message);
        }

        this.path = path;
		this.reader = new NetCDFReader(data); // read the header
		
		this.daPath = utils.getDaFilePathFromPath(path);
		logger.info(this.daPath);
		if(fs.existsSync(this.daPath)) {
            this.daReader = new NetCDFReader(fs.readFileSync(this.daPath));
            this.daDimensions = this.daReader.dimensions;
            this.daTime = this.daDimensions.find(dim => dim.name === dimensions.time).size;
		}

        this.header = this.reader.header;
        this.dimensions = this.reader.dimensions;
        this.variables = this.reader.variables;

        this.depthSize = this.dimensions.find(dim => dim.name === dimensions.Z).size;
        this.ySize = this.dimensions.find(dim => dim.name === dimensions.Y).size;
        this.xSize = this.dimensions.find(dim => dim.name === dimensions.X).size;
        this.time = this.dimensions.find(dim => dim.name === dimensions.time).size;
        
        this.timeArray = this.reader.getDataVariable(variables.TIME);
        this.depthArray = this.reader.getDataVariable(variables.DEPTH);
        this.longitudeArray = this.reader.getDataVariable(variables.LONGITUDE);
        this.latitudeArray = this.reader.getDataVariable(variables.LATITUDE);
    }

    getLayer (variable, time, depth) {
        let size = this.ySize * this.xSize;

        let timeIndex = utils.getIndexFromValue(this.timeArray, dateUtils.transformDate(time));
        let startIndex = 0;
        let message = '';

        if (depth !== null && depth !== undefined) {
            let depthIndex = utils.getIndexFromValue(this.depthArray, Math.abs(depth) * -1);
            startIndex = timeIndex * this.depthSize * size + depthIndex * size;
            message = `Retrieve ${variable} data from file ${this.path} at time index ${timeIndex} and depth index ` +
                `${depthIndex} (initial index = 0) on a 2D array of size ${this.xSize}x${this.ySize}`;
        } else {
            startIndex = timeIndex * size;
            message = `Retrieve ${variable} data from file ${this.path} at time index ${timeIndex} ` +
                `(initial index = 0) on a 2D array of size ${this.xSize}x${this.ySize}`;
        }

        let result = this.reader.getDataVariableSlice(variable, startIndex, size);

        logger.info(message);

        return utils.formatTable(this.ySize, this.xSize, result);
    }

    getTable (x, y, variable, startTime, endTime, depth, includeRange = false) {
        let table = [];

        let coordinates = utils.getCoordinatesIndex(utils.formatTable(this.ySize, this.xSize, this.longitudeArray),
            utils.formatTable(this.ySize, this.xSize, this.latitudeArray), x, y);
        let colIndex = coordinates.N;
        let rowIndex = coordinates.M;

        let startTimeIndex = utils.getIndexFromValue(this.timeArray, dateUtils.transformDate(startTime));
        let endTimeIndex = utils.getIndexFromValue(this.timeArray, dateUtils.transformDate(endTime));
        let timeSize = endTimeIndex - startTimeIndex + 1;

        let depthLabel = ['/'];
        let depthSize = 1;
        let depthIndex;

        if ((depth || depth === 0) && depth !== 'all') {
            depthIndex = utils.getIndexFromValue(this.depthArray, Math.abs(depth) * -1);
            depthLabel = [this.depthArray[depthIndex].toFixed(1)];
        } else if (depth === 'all') {
            depthIndex = 'all';
            depthSize = this.depthArray.length;
            depthLabel = this.depthArray.map(d => d.toFixed(1));
        }

        if(includeRange) {
            depthLabel = depthLabel.reduce((r, a) => r.concat(a, ['min', 'max']), []);
        }

        if (variable === 'velocity') {
            let resultVx = this.getValues(colIndex, rowIndex, variables.HORIZONTAL_VELOCITY, startTimeIndex, endTimeIndex, timeSize, depthIndex, depthSize);
            let resultVy = this.getValues(colIndex, rowIndex, variables.VERTICAL_VELOCITY, startTimeIndex, endTimeIndex, timeSize, depthIndex, depthSize);
            table = utils.formatTable(depthSize, timeSize, resultVx, resultVy);
            if(includeRange) {
				
				let resultMinUV = this.getValues(colIndex, rowIndex, variables.VELOCITY_MIN, startTimeIndex, endTimeIndex, timeSize, depthIndex, depthSize);
				let resultMaxUV = this.getValues(colIndex, rowIndex, variables.VELOCITY_MAX, startTimeIndex, endTimeIndex, timeSize, depthIndex, depthSize);


                if(resultMinUV && resultMaxUV) {
                    // Append min and max only when they are available

                    let resultArrayMin = utils.formatTable(depthSize, resultMinUV.length, resultMinUV);
                    let resultArrayMax = utils.formatTable(depthSize, resultMaxUV.length, resultMaxUV);

                    let resultArray = []
                    for(let i = 0; i < table.length; i++) {
                        resultArray.push(table[i]);
                        if(resultArrayMin.length > i) {
                            resultArray.push(resultArrayMin[i]);
                        } else {
                            resultArray.push(-999); // Will be transformed to NaN
                        }
                        if(resultArrayMax.length > i) {
                            resultArray.push(resultArrayMax[i]);
                        } else {
                            resultArray.push(-999); // Will be transformed to NaN
                        }
                    }
                    table = resultArray;
                }
            }
        } else {
            let result = this.getValues(colIndex, rowIndex, variable, startTimeIndex, endTimeIndex, timeSize, depthIndex, depthSize);
            table = utils.formatTable(depthSize, timeSize, result);
            if(includeRange) {

                let resultMin = this.getValues(colIndex, rowIndex, variable+"_MIN", startTimeIndex, endTimeIndex, timeSize, depthIndex, depthSize);
				let resultMax = this.getValues(colIndex, rowIndex, variable+"_MAX", startTimeIndex, endTimeIndex, timeSize, depthIndex, depthSize);

                if(resultMin && resultMax) {
                    // Append min and max only when they are available
                    let resultArrayMin = utils.formatTable(depthSize, resultMin.length, resultMin);
                    let resultArrayMax = utils.formatTable(depthSize, resultMax.length, resultMax);

                    let resultArray = []
                    for(let i = 0; i < table.length; i++) {
                        resultArray.push(table[i]);
                        if(resultArrayMin.length > i) {
                            resultArray.push(resultArrayMin[i]);
                        } else {
                            resultArray.push(-999); // Will be transformed to NaN
                        }
                        if(resultArrayMax.length > i) {
                            resultArray.push(resultArrayMax[i]);
                        } else {
                            resultArray.push(-999); // Will be transformed to NaN
                        }
                    }
                    table = resultArray;
                }
            }
        }

        let timeLabel = dateUtils.getTimeLabel(this.timeArray, startTimeIndex, endTimeIndex);

        return utils.addLabel(table, timeLabel, depthLabel);
    }

    getValues (colIndex, rowIndex, variable, startTimeIndex, endTimeIndex, timeSize, depthIndex, depthSize) {
        let result = [];

        if ((depthIndex || depthIndex === 0) && depthIndex !== 'all') {
            logger.info(`Retrieve ${variable} data at position ` +
                `(${startTimeIndex}-${endTimeIndex}, ${depthIndex}, ${rowIndex}, ${colIndex}) (initial index = 0)`);
            result = this.getDataVariableFiltered(variable, startTimeIndex, timeSize, depthIndex, depthSize, rowIndex, 1, colIndex, 1);
        } else if (depthIndex === 'all') {
            logger.info(`Retrieve ${variable} data at position ` +
                `(${startTimeIndex}-${endTimeIndex}, 0-${depthSize}, ${rowIndex}, ${colIndex}) (initial index = 0)`);
            result = this.getDataVariableFiltered(variable, startTimeIndex, timeSize, 0, depthSize, rowIndex, 1, colIndex, 1);
        } else {
            logger.info(`Retrieve ${variable} data at position ` +
                `(${startTimeIndex}-${endTimeIndex}, ${rowIndex}, ${colIndex}) (initial index = 0)`);
            result = this.getDataVariableFiltered(variable, startTimeIndex, timeSize, rowIndex, 1, colIndex, 1);
        }

        return result;
    }

    getWeekData (variable, depth) {
        let result = [];
        let size = this.xSize * this.ySize;
        let depthIndex = 0;

        if (depth || depth === 0) {
            depthIndex = utils.getIndexFromValue(this.depthArray, Math.abs(depth) * -1);
            depth = this.depthArray[depthIndex];
        }

        utils.addToWeekData(result, this.xSize, this.ySize, this.longitudeArray);
        utils.addToWeekData(result, this.xSize, this.ySize, this.latitudeArray);

        if (variable === variables.VELOCITY) {
            let dataX = this.getDataVariableFiltered(variables.HORIZONTAL_VELOCITY, 0, this.timeArray.length, depthIndex, 1, 0, this.xSize, 0, this.ySize);
            for (let timeIndex = 0; timeIndex < this.timeArray.length; timeIndex++) {
                utils.addToWeekData(result, this.xSize, this.ySize, dataX.slice(timeIndex * size, (timeIndex + 1) * size));
            }

            let dataY = this.getDataVariableFiltered(variables.VERTICAL_VELOCITY, 0, this.timeArray.length, depthIndex, 1, 0, this.xSize, 0, this.ySize);
            for (let timeIndex = 0; timeIndex < this.timeArray.length; timeIndex++) {
                utils.addToWeekData(result, this.xSize, this.ySize, dataY.slice(timeIndex * size, (timeIndex + 1) * size));
            }
        } else {
            utils.addToWeekData(result, this.xSize, this.ySize,
                utils.createDepthArray(depth, size));
            let data = (depth || depth === 0)
                ? this.getDataVariableFiltered(variable, 0, this.timeArray.length, depthIndex, 1, 0, this.xSize, 0, this.ySize)
                : this.getDataVariableFiltered(variable, 0, this.timeArray.length, 0, this.xSize, 0, this.ySize);

            for (let timeIndex = 0; timeIndex < this.timeArray.length; timeIndex++) {
                utils.addToWeekData(result, this.xSize, this.ySize, data.slice(timeIndex * size, (timeIndex + 1) * size));
            }
        }

        return result;
    }
	
	getDataVariableFiltered(variableName, start, end, ...filterValues) {
		// Try to retrive avg data from data assimilation. If not, return data from regular simulation
		let data = null;
		if(this.daReader && !config.da_disabled) {
			if(variableName.endsWith('MAX') || variableName.endsWith('MIN')) {
				logger.info(`Retrieve ${variableName} data from file ${this.daPath}`);
				try {
                    // If DA data contains less timesteps than normal simulation (likely to happen since DA takes more time to finish)
                    data = this.daReader.getDataVariableFiltered(variableName, start, Math.min(end, this.daTime), ...filterValues);
				} catch (err) {
					logger.info(err.message);
				}
			} else {
				logger.info(`Retrieve ${variableName}_AVG data from file ${this.daPath}`);
				try {
                    let dataDa = this.daReader.getDataVariableFiltered(variableName+"_AVG", start, Math.min(end, this.daTime), ...filterValues);
                    logger.info(`Read ${dataDa.length} data for ${variableName}_AVG from file ${this.daPath}`);

                    logger.info(`Retrieve ${variableName} data from file ${this.path}`);
                    let dataStd = this.reader.getDataVariableFiltered(variableName, start, end, ...filterValues);

                    let dataSlice = dataStd.slice(dataDa.length);
                    logger.info(`Read ${dataSlice.length} more data for ${variableName} from file ${this.path}`);
                    data = dataDa.concat(dataSlice);
				} catch(err) {
					logger.info(err.message);
				}
			}
		} else {
			logger.info(`Retrieve ${variableName} data from file ${this.path}`);
			try {
				data = this.reader.getDataVariableFiltered(variableName, start, end, ...filterValues);
			} catch (err) {
				logger.info(err.message);
			}
		}
		return data;
	}
}

module.exports = MeteolakesFile;
