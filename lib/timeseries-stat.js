var _= require('lodash');
var Autofit = require('./timeseries-autofit');
/**
 * 统计数据根据时间的变化趋势
 * @param model 数据模型，模型必须有时间字段
 * @param options
 * timeFieldName 时间字段，默认是'createdAt'
 * unit - 时间统计单位，可以按天、按小时、按月
 * start - 开始时间
 * end  - 结束时间
 * query - 时间之外的查询条件
 * reduceFields - {[String]}要累计的字段['totalFee'],默认统计count表示总数
 * autofit -  {Boolean, default:false} 是否进行数据填充，某天，某月数据位空时，自动进行填充.
 */
exports.statByTime = function (model, options, callback) {
    var option = options || {};
    var timeFieldName = option.timeFieldName || 'createdAt';
    var unit = option.unit || 'day';
    var start = option.start;
    var end = option.end;
    var reduceFields = option.reduceFields || [];
    var autofit;
    if(option.hasOwnProperty('autofit'))
        autofit = option.autofit;
    else
        autofit = true;
    //如果没有自带时间，求开始时间和结束时间
    if(!end)end = new Date(); //取当前时间
    if (!start) {
        if (unit == 'year') {
            start =new Date(end.getFullYear()-9);
        } else if (unit == 'month') {
            start =new Date(end.getFullYear(),end.getMonth()-11);
        } else if (unit == 'day') {
            start =new Date(end.getFullYear(),end.getMonth(),end.getDate()-29);
        } else if (unit == 'hour') {
            start =new Date(end.getFullYear(),end.getMonth(),end.getDate(),end.getHours()-23);
        } else if (unit == 'minute') {
            start =new Date(end.getFullYear(),end.getMonth(),end.getDate(),end.getHours(),date.getMinutes()-59);
        }
    }
    console.log(start,end);
    var o = {};
    o.map = buildMapFuncion(timeFieldName,unit,reduceFields);
    o.reduce =buildReduceFuncion(reduceFields);
    o.query = option.query || {};
    o.query[timeFieldName] = {$gte: start, $lt: end};
    model.mapReduce(o, function (err, results) {
        if (err) {
            return callback(err, null);
        }
        if(results.length==0)
        {
            return  callback(null, {});
        }
        var data = convertDbResults(results,unit);
        if(autofit)
        {
            callback(null, Autofit.fitTimeSeries4ArrayInObj(data,{unit:unit,start:start,end:end}) );
        }
        else
        {
            callback(null, data);
        }
    });
};

/**
 * //动态构建函数
 //o.map = function () {
    //    var date = this["createdAt"];
    //    var month= date.getMonth() + 1;
    //    var dateKey = ""+date.getFullYear() +'/' + (month<10?'0'+month:month)  +'/' +  date.getDate() ;
    //    emit(dateKey, 1);
    //};
   测试函数：
     console.log('',buildMapFuncion('createdAt','day',['totalFee']));
 * @param timeFieldName
 * @param unit
 * @param reduceFields
 * @returns {*}
 */
var buildMapFuncion = function(timeFieldName,unit,reduceFields)
{
    var funcStr = " var date = this['" + timeFieldName + "'];\n";
    funcStr += " var dateKey = ''+date.getFullYear();";
    if (unit == 'year') {

     } else if (unit == 'month') {
        funcStr += " var month= date.getMonth() + 1;\n"
        funcStr += " var dateKey = dateKey +'-' + (month<10?'0'+month:month) ;\n";
    } else if (unit == 'day') {
        funcStr += " var month= date.getMonth() + 1;\n"
        funcStr += " var date= date.getDate();\n"
        funcStr += " var dateKey = dateKey +'-' + (month<10?'0'+month:month)  +'-' +  (date<10?'0'+date:date) ;\n";
    } else if (unit == 'hour') {
        funcStr += " var hour = date.getHours();\n"
        funcStr += " var date= date.getDate();\n"
        funcStr += " var month= date.getMonth() + 1;\n"
        funcStr += " var dateKey = dateKey +'-' + (month<10?'0'+month:month)  +'-' +  (date<10?'0'+date:date) +' '+(hour<10?'0'+hour:hour)  ;\n";
    }
    funcStr += " var value={count: 1};\n";
    for (var i in reduceFields) {
        funcStr += (" value." + reduceFields[i] + "=this." + reduceFields[i] + ";\n");
    }
    funcStr += " emit(dateKey, value);";
    return new Function('', funcStr);
}

/**
 * 动态构建函数
 o.reduce = function (k, vals) {
    var reducedVal = { count: 0, totalFee: 0 };
    for (var i = 0; i < vals.length; i++) {
        reducedVal.count += vals[i].count;
        reducedVal.totalFee += vals[i].totalFee;
    }
    return reducedVal;
};
 测试函数：
 console.log('',buildReduceFuncion(['totalFee']));
 */
var buildReduceFuncion = function(reduceFields)
{
    var funcStr = "var reducedVal = { count: 0};\n";
    for (var i in reduceFields) {
        funcStr += ("reducedVal." + reduceFields[i] + "=0;\n");
    }
    funcStr += "for (var i = 0; i < vals.length; i++) { \n";
    funcStr += " reducedVal.count += vals[i].count; \n";
    for (var i in reduceFields) {
        funcStr += (" reducedVal." + reduceFields[i] + " += vals[i]." + reduceFields[i] + ";\n");
    }
    funcStr += "} \n";
    funcStr += "return reducedVal;";
    return new Function("k, vals", funcStr);
}

var convertDbResults = function(dbResults,unit)
{
    if(dbResults.length==0)
        throw 'dbResults.length==0'
    var ret = {};
    ret[unit]=_.map(dbResults, "_id");
    var keys = Object.keys(dbResults[0].value);
    for(var i in keys)
    {
        ret[keys[i]]=_.map(dbResults, "value."+keys[i]);
    }
    return ret;
};

