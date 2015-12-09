/**
 * Created by lcz on 15/12/8.
 */
var moment = require('moment');
var t = module.exports;
var util = require('./util');


/**
 * fit time series.conver part time series to all time series with values.
 * @param {Object} inputObj part time series with values.
 * @param {Object} options
 *
 * @returns {Object} outputObj Return the all time series with values.
 * @example
 *
 var inputObj = {};
 inputObj.month = ['2015-10','2015-11'];
 inputObj.income = [100001,98888];
 inputObj.cost = [70001,78888];
 console.log('input:',inputObj);
 var end = moment(inputObj.month[inputObj.month.length-1], "YYYY-MM");
 var start = moment(end).subtract(8, 'months');
 var outputObj = fitTimeSeries(inputObj,{timeField : 'month',end:end,start:start});
 console.log('output:',outputObj);

 //input: { month: [ '2015-10', '2015-11' ],
 //                   income: [ 100001, 98888 ],
 //                   cost: [ 70001, 78888 ] }
 //output:
 { month:
   [ '2015-03',
     '2015-04',
     '2015-05',
     '2015-06',
     '2015-07',
     '2015-08',
     '2015-09',
     '2015-10' ],
  income: [ 0, 0, 0, 0, 0, 0, 0, 100001 ],
  cost: [ 0, 0, 0, 0, 0, 0, 0, 70001 ] }
 */
var fitTimeSeries4ArrayInObj = function (inputObj, options) {
    var timeFormat = options.timeFormat;
    var timeField = options.timeField;
    var end = options.end;
    var start = options.start;
    var unit = options.unit;

    if (!unit && !timeField) {
        throw "timeField or unit must have value";
    }
    if(!timeField)timeField=unit;
    if(!unit)unit = timeField;


    if (!timeFormat) {
        if (unit == 'year') {
            timeFormat = "YYYY";
        } else if (unit == 'month') {
            timeFormat = "YYYY-MM";
        } else if (unit == 'day') {
            timeFormat = "YYYY-MM-DD";
        } else if (unit == 'hour') {
            timeFormat = "YYYY-MM-DD HH";
        }
        else {
            throw "unsupported unit:" + unit+'!';
        }
    }

    if (!end) {
        var timeSeries = inputObj[timeField];
        end = moment(timeSeries[timeSeries.length - 1], timeFormat);
    }else
    {
        end = moment(end);
    }


    if (!start) {
        if (unit == 'month') {
            start = moment(end).subtract(12-1, 'months');
        } else if (unit == 'day') {
            start = moment(end).subtract(30-1, 'days');
        } else if (unit == 'year') {
            start = moment(end).subtract(10-1, 'years');
        } else if (unit == 'hour') {
            start = moment(end).subtract(24-1, 'hours');
        }
    }
    else
    {
        start = moment(start);
    }

    //计算所有的时间序列
    var allTimeSeries = [];
    while (start <= end) {
        allTimeSeries.push(start.format(timeFormat));
        start.add(1, unit + 's');
    }

    //把时间字段外的其它字段提取出来
    var otherFieldList = [];
    for (var key in inputObj) {
        if (key != timeField)
            otherFieldList.push(key);
    }
    //初始化输出对象
    var outputObj = {};
    outputObj[timeField] = new Array(allTimeSeries.length);
    for (var i in otherFieldList) {
        outputObj[otherFieldList[i]] = new Array(allTimeSeries.length);
    }

    //根据输入对象，按时间序列进行比较，对非时间字段进行赋值
    var i = 0, j = 0;
    var partTimeSeries = inputObj[timeField];
    for (; i < allTimeSeries.length; i++) {
        outputObj[timeField][i] = allTimeSeries[i];
        if (allTimeSeries[i] == partTimeSeries[j] && j < partTimeSeries.length) {
            for (var k in otherFieldList) {
                outputObj[otherFieldList[k]][i] = inputObj[otherFieldList[k]][j];
            }
            j++;
        }
        else {
            for (var k in otherFieldList) {
                outputObj[otherFieldList[k]][i] = 0;
            }
        }
    }
    return outputObj;
}

t.fitTimeSeries4ArrayInObj = fitTimeSeries4ArrayInObj;

t.fitTimeSeries4ObjInArray = function (inputObj, options) {
    var inputObj1= util.convert2ArrayInObject(inputObj);
    var outputObj = fitTimeSeries4ArrayInObj(inputObj1, options);
    return util.convert2ObjInArray(outputObj);
}

