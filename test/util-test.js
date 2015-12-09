var util= require('../lib/util');




var inputObj =  { month: [ '2015-10', '2015-11' ],
    income: [ 100001, 98888 ],
    cost: [ 70001, 78888 ] }
var outputObj = util.convert2ObjInArray(inputObj);
console.log('\n====convert2ObjInArray:output===\n',outputObj);


var input = [{month: '2015-10', income: 100001, cost: 70001},
    {month: '2015-11', income: 98888, cost: 78888}];
var outputObj2 = util.convert2ArrayInObject(input);
console.log('\n====convert2ArrayInObject:output===\n', outputObj2);


var start = new Date("2015-08-15T03:00:00.000Z")
var end = new Date("2015-09-20T03:00:00.000Z")
console.log('\n====createAllTimeSeries:output===\n');
console.log(util.createAllTimeSeries(start,end,'month'));
console.log('\n====createAllTimeSeriesStr:output===\n');
console.log(util.createAllTimeSeriesStr(start,end,'month'));