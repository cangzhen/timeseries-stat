/**
 * Created by lcz on 15/12/8.
 */
var moment = require('moment');
var t = require('../lib/timeseries-autofit-date');

var inputObj = {};
inputObj.month = [new Date("2015-08-31T16:00:00.000Z"),new Date("2015-10-31T16:00:00.000Z")];
console.log(inputObj.month)
inputObj.income = [100001,98888];
inputObj.cost = [70001,78888];
var outputObj = t.fitTimeSeries4ArrayInObj(inputObj, {timeField: 'month'});

console.log('====fitTimeSeries4ArrayInObj:output===\n', outputObj);

var input = [{month: new Date("2015-08-31T16:00:00.000Z"), income: 100001, cost: 70001},
    {month: new Date("2015-10-31T16:00:00.000Z"), income: 98888, cost: 78888}];

console.log('====convert2ArrayInObject:output===\n', t.fitTimeSeries4ObjInArray(input,{timeField:'month'}));