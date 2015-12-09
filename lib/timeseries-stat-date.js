var _= require('lodash');
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
 * padding -  {Boolean, default:false} 是否进行数据填充，某天，某月数据位空时，自动进行填充.
 */
exports.statByTime = function (model, options, callback) {
    var option = options || {};
    var timeFieldName = option.timeFieldName || 'createdAt';
    var unit = option.unit || 'day';
    var start = option.start;
    var end = option.end;
    var reduceFields = option.reduceFields || [];
    var padding = option.padding || false;
    //如果没有自带时间，求开始时间和结束时间
    if (!start || !end) {
        end = new Date(); //取当前时间
        if (unit == 'year') {
            start =new Date(end.getFullYear()-10);
        } else if (unit == 'month') {
            start =new Date(end.getFullYear(),end.getMonth()-12);
        } else if (unit == 'day') {
            start =new Date(end.getFullYear(),end.getMonth(),end.getDate()-30);
        } else if (unit == 'hour') {
            start =new Date(end.getFullYear(),end.getMonth(),end.getDate(),end.getHours()-24);
        } else if (unit == 'minute') {
            start =new Date(end.getFullYear(),end.getMonth(),end.getDate(),end.getHours(),date.getMinutes()-60);
        }
    }
    var o = {};
    o.map = buildMapFuncion(timeFieldName,unit,reduceFields);
    console.log(o.map);
    o.reduce =buildReduceFuncion(reduceFields);
    o.query = option.query || {};
    o.query[timeFieldName] = {$gte: start, $lt: end};
    console.log(o);
    model.mapReduce(o, function (err, results) {
        if (err) {
            return callback(err, null);
        }
        if(padding)
        {
            var results1 = paddingData(results,reduceFields,start,end,unit);
            callback(null, convertDbResults(results1,unit));
        }
        else
        {
            callback(null, convertDbResults(results,unit));
        }
    });
};

/**
 * //动态构建函数
 //o.map = function () {
    //    var date = this["createdAt"];
    //    var dateKey = new Date(date.getFullYear(),date.getMonth()); ;
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
    funcStr += " var dateKey= new Date(date.getFullYear()"
    if(!unit)unit = 'day';

    if (unit == 'year') {
        funcStr += ");\n"
    } else if (unit == 'month') {
        funcStr += ",date.getMonth());\n"
    } else if (unit == 'day') {
        funcStr += ",date.getMonth(),date.getDate());\n"
    } else if (unit == 'hour') {
        funcStr += ",date.getMonth(),date.getDate(),date.getHours());\n"
    } else if (unit == 'minute') {
        funcStr += ",date.getMonth(),date.getDate(),date.getHours(),date.getMinutes());\n"
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

/**
 * 对缺失数据进行填充
 * @param dbResults
 * @param reduceFields
 * @param start
 * @param end
 * @param unit
 * @returns {*}
 */
var paddingData = function(dbResults,reduceFields,start,end,unit)
{
    var allKeys = createAllKeys(start, end, unit);
    var paddingResults={};
    for(var i in allKeys)
    {
        var value = {count:0};
        for (var j in reduceFields) {
            value[reduceFields[j]]=0;
        }
        paddingResults[allKeys[i]]={_id:allKeys[i],value:value};
    }
    for(var i in dbResults)
    {
        paddingResults[dbResults[i]._id] = dbResults[i];
    }
    return  _.values(paddingResults);
}

var convertDbResults = function(dbResults,unit)
{
    var ret = {};
    ret[unit]=_.map(dbResults, "_id");
    var keys = Object.keys(dbResults[0].value);
    for(var i in keys)
    {
        ret[keys[i]]=_.map(dbResults, "value."+keys[i]);
    }
    return ret;
}

//var createAllKeys = function(start,end,unit)
//{
//    var keys = [];
//    var date = new Date();
//    date.setTime(start.getTime());
//    while(date < end)
//    {
//        var month= date.getMonth() + 1;
//        var dateKey = "";
//        if(!unit || unit=='day')
//        {
//            dateKey = dateKey +date.getFullYear() +'/' + (month<10?'0'+month:month) + '/' +  date.getDate() ;
//            date.setDate(date.getDate()+1);
//
//        }else if(unit=='month')
//        {
//            dateKey = dateKey +date.getFullYear() +'/' + (month<10?'0'+month:month) ;
//            date.setMonth(date.getMonth()+1);
//        }else if(unit=='hour')
//        {
//            var hour = date.getHours();
//            dateKey = dateKey +date.getDate()+'-'+(hour<10?'0'+hour:hour) ;
//            date.setHours(date.getHours()+1);
//        }
//        keys.push(dateKey);
//    }
//    return keys;
//};

var now = new Date();
console.log(now.getTime());
console.log(new Date(Math.round(now.getTime()/60000)*60000));
console.log(new Date(Math.round(now.getTime()/86400000)*86400000));
console.log(new Date(Math.round(now.getTime()/3600000)*3600000));

console.log(new Date(now.getFullYear()));
console.log(new Date(now.getFullYear(),now.getMonth()));
console.log(new Date(now.getFullYear(),now.getMonth(),now.getDay()));
console.log(new Date(now.getFullYear(),now.getMonth(),now.getDay(),now.getHours()));
console.log(new Date(now.getFullYear(),now.getMonth(),now.getDay(),now.getHours(),now.getMinutes()));

