
var t = require('timeseries-stat').autofit;

var inputObj = {};
inputObj.month = ['2014-09','2015-09','2015-11'];
inputObj.income = [50,100001,98888];
inputObj.cost = [90,70001,78888];
var outputObj = t.fitTimeSeries4ArrayInObj(inputObj, {timeField: 'month'});

console.log('====fitTimeSeries4ArrayInObj:output===\n', outputObj);

var input = [{month: '2015-09', income: 100001, cost: 70001},
    {month: '2015-11', income: 98888, cost: 78888}];

console.log('====convert2ArrayInObject:output===\n', t.fitTimeSeries4ObjInArray(input,{timeField:'month'}));