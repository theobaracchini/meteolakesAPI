# MeteolakesAPI

REST API allowing you to retreive specific data related to the meteolakes.ch webapp.

## Set Up

Run `$ npm install` and then you can start the application locally using `$ npm start `

## Deployment

* Run `$ npm run build`
* Then copy paste `dist` folder, `config` folder and `package.json` on your server
* Run `$ npm install` from your server
* Finally, run `$ npm run serve` to start server.
* Note that you need to deploy the package `netcdfjs` in a sibling folder. checkout branch filter-data

## API Documentation

### /api/:lake/:variable/:time/:depth
this path allows the user to retrieve a CSV file containing a single layer of the chosen variable at a given timestamp and depth.  

### /api/:lake/:variable/:time
this path allows the user to retrieve a CSV file containing a single layer of the chosen variable at a given timestamp. This path doesn't use the path parameter, it is only used for variables that don't include that dimension. (valid only for variable = water_level)

### /api/coordinates/:x/:y/:lake/:variable/:startTime/:endTime
this path allows the user to retrieve a CSV file containing a table of values timeXdepth at a given position. This path doesn't use the depth parameter, meaning it will retrieve the values at all depth points. Please note that startTime and endTime need to belong to the same week. 

### /api/coordinates/:x/:y/:lake/:variable/:startTime/:endTime/:depth
this path allows the user to retrieve a CSV file containing an array of values according to time at a given position and depth. Please note that startTime and endTime need to belong to the same week.

### /api/week/:weekNumber/:year/:lake/:variable/:depth
this path allows the user to retrieve a CSV file containing all data relative to a specified lake and variable type for a specific depth layer on all the timestamps of the selected week of the year.

### /api/week/:weekNumber/:year/:lake/:variable
this path allows the user to retrieve a CSV file containing all data relative to a specified lake and variable type at the surface on all the timestamps of the selected week of the year. (valid only for variable = water_level)

### Variables
| Variable Name | description                                   | possible values                                                     |
| ------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| :lake         | name of the lake                              | geneva/ greifensee / biel                                           |
| :variable     | name of the variable in letters               | temperature / water_level / velocity                                |
| :time         | javascript timestamp                          | e.g.: 1539583200000                                                 |
| :depth        | depth in meters                               | e.g.: 200                                                           |
| :x            | swiss longitude coordinate                     | e.g.: 532830                                                        |
| :y            | swiss latitude coordinate                    | e.g.: 144660                                                        |
| :startTime    | javascript timestamp where to start selection | e.g.: 1539583200000                                                 |
| :endTime      | javascript timestamp where to end selection   | e.g.: 1539583200000                                                 |

Please note that all timestamps will be interpreted as UTC times. Therefore be sure to transmit the desired timestamp translated at UTC time.
For example, if you want data on November 1st 2018 at 03:00 be sure to pass the corresponding timestamps (November 1st 2018 at 03:00 UTC ->
1541041200000)

## Testing
In order to be able to run the integration tests, you need a folder called meteolkaesAPI_data (sibling to the meteolakesAPI folder) with the following structure:
`
meteolakesAPI_data
|--data
| |--2018
|   |--netcdf
|     |--geneva_2018_week30.nc
|
|--data_greifensee
  |--2018
    |--netcdf
      |--greifensee_2018_week44.nc`