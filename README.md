# MeteolakesAPI

REST API allowing you to retreive specific data related to the meteolakes.ch webapp.

## Set Up

Run `$ npm install` and then you can start the application locally using `$ npm start `

## Deployment

* Run `$ npm run build`
* Then copy paste `dist` folder, `config` folder and `package.json` on your server
* Run `$ npm install` from your server
* Finally, run `$ npm run serve` to start server.
* Note that you need to deploy the package `netcdfjs` in a sibling folder and have the data stored in a sibling folder called `data`.

## API Documentation

### /api/:lake/:variable/:time/:depth
this path allows the user to retrieve a CSV file containing a single layer of the chosen variable at a given timestamp and depth.  

### /api/:lake/:variable/:time
this path allows the user to retrieve a CSV file containing a single layer of the chosen variable at a given timestamp. This path doesn't use the path parameter, it is only used for variables that don't include that dimension.  

### /api/:lake/:variable/:time/:depth/:x/:y
this path allows the user to retrieve a CSV file containing a single value of the chosen variable at a given timestamp and depth. This path doesn't use the path parameter, it is only used for variables that don't include that dimension.  

### /api/:lake/:variable/:time/:x/:y
this path allows the user to retrieve a CSV file containing a single layer of the chosen variable at a given timestamp. This path doesn't use the path parameter, it is only used for variables that don't include that dimension.  

### Variables
| Variable Name | description                     | possible values                                                     |
| ------------- | ------------------------------- | ------------------------------------------------------------------- |
| :lake         | name of the lake                | geneva/ greifen/ biel                                               |
| :variable     | name of the variable in letters | temperature / water_level / horizontal_velocity / vertical_velocity |
| :time         | javascript timestamp            | e.g.: 1539583200000                                                 |
| :depth        | depth in meters                 | e.g.: 200                                                           |
| :x            | swiss latitude coordinate       | e.g.: 532830                                                        |
| :y            | swiss longitude coordinate      | e.g.: 144660                                                        |