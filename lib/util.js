/**
 * Created by lcz on 15/12/8.
 */
var moment = require('moment');
var util = module.exports;
/**
 *
 * @param inputObj
 * @returns {Array}
 * @example

 var inputObj = {};
 inputObj.month = ['2015-10','2015-11'];
 inputObj.income = [100001,98888];
 inputObj.cost = [70001,78888];

 var outputObj = convertArray2Object(inputObj);
 console.log('====input===\n',inputObj);
 console.log('====output===\n',outputObj);
 */
var convert2ObjInArray = function (inputObj) {
    var outputObj = [];
    for (var key in inputObj) {
        var values = inputObj[key];
        for (var i in values) {
            if (!outputObj[i]) {
                outputObj[i] = {};
            }
            outputObj[i][key] = values[i];
        }
    }
    return outputObj
}
util.convert2ObjInArray = convert2ObjInArray;

var convert2ArrayInObject = function (inputObj) {
    var objectNotNull = inputObj[0];
    var outputObj = {};
    for (var key in objectNotNull) {
        outputObj[key] = new Array(inputObj.length);
    }
    var keys = Object.keys(outputObj);
    //遍历数组中的对象，把对象中属性的值，赋值为对象中的数组
    for (var i in inputObj) {
        var element = inputObj[i];
        for (var j = 0; j < keys.length; j++) {
            outputObj[keys[j]][i] = element[keys[j]];
        }
    }
    return outputObj;
}
util.convert2ArrayInObject = convert2ArrayInObject;


/**
 * 根据开始时间和结束时间，按着unit进行单位填充,为半闭半开区间 [startTime,endTime)
 * @param startTime 开始时间
 * @param endTime  结束时间
 * @param unit 'day','month','hour' default is 'day'
 */
util.createAllTimeSeries = function(startTime,endTime,unit)
{
    var keys = [];
    var date = startTime;
    if(!unit)unit = 'day';

    if (unit == 'year') {
        date =new Date(date.getFullYear());
    } else if (unit == 'month') {
        date =new Date(date.getFullYear(),date.getMonth());
    } else if (unit == 'day') {
        date =new Date(date.getFullYear(),date.getMonth(),date.getDate());
    } else if (unit == 'hour') {
        date =new Date(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours());
    } else if (unit == 'minute') {
        date =new Date(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes());
    }

    while(date < endTime)
    {
        keys.push(date);
        if (unit == 'year') {
            date =new Date(date.getFullYear()+1);
        } else if (unit == 'month') {
            date =new Date(date.getFullYear(),date.getMonth()+1);
        } else if (unit == 'day') {
            console.log(date);
            date =new Date(date.getFullYear(),date.getMonth(),date.getDate()+1);
        } else if (unit == 'hour') {
            date =new Date(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours()+1);
        } else if (unit == 'minute') {
            date =new Date(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes()+1);
        }
    }
    return keys;
};

util.createAllTimeSeriesStr = function(startTime,endTime,unit)
{
    var keys = [];
    var date = new Date();
    date.setTime(startTime.getTime());
    while(date < endTime)
    {

        var dateKey = "" +date.getFullYear();
        var month= date.getMonth() + 1;
        if(unit=='year')
        {
            date.setFullYear(date.getFullYear()+1);
        }else if(unit=='month')
        {
            dateKey = dateKey +'-' + (month<10?'0'+month:month) ;
            date.setMonth(date.getMonth()+1);
        }else if(unit=='day')
        {
            var date = date.getDate();
            dateKey = dateKey +'-' + (month<10?'0'+month:month) + '-' +  (date<10?'0'+date:date) ;
            date.setDate(date.getDate()+1);

        }else if(unit=='hour')
        {
            var date = date.getDate();
            var hour = date.getHours();
            dateKey = dateKey +'-' + (month<10?'0'+month:month) + '-' +  (date<10?'0'+date:date)+' '+(hour<10?'0'+hour:hour) ;
            date.setHours(date.getHours()+1);
        }
        keys.push(dateKey);
    }
    return keys;
};

