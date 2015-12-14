# Timeseries statistics util #

## 统计数据的时间变化趋势
**统计数据根据时间的变化趋势**

- model 数据模型，模型必须有时间字段
- options
    + timeFieldName {String}时间字段名称，默认是'createdAt'
    + unit - {String}时间统计单位，为枚举值,{'year','month','day','hour','minute']
    + start - {Date}开始时间
    + end  - {Date}结束时间
    + query - {Object}时间之外的查询条件
    + reduceFields - {[String]}要累计的字段,如果为空，则进行count计算
    + autofit -  {Boolean, default:false} 是否进行数据填充，当某个时间序点数值为空时，自动进行填充.


**样例**
```js
var statUtils = require('timeseries-stat');

statUtils.statByTime(model, {unit: 'month', reduceFields: ['totalFee']}, function (err, results) {
        console.info('autofit result\n', results);
 })
```

**输出结果为**
```
 { month: 
   [ '2015-01',
     '2015-02',
     '2015-03',
     '2015-04',
     '2015-05',
     '2015-06',
     '2015-07',
     '2015-08',
     '2015-09',
     '2015-10',
     '2015-11',
     '2015-12' ],
  count: [ 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 4, 1 ],
  totalFee: [ 0, 0, 0, 0, 0, 0, 0, 0, 5000, 5000, 21500, 6000 ] }
```

`执行用例可以参见test/timeseries-stat-test.js文件`

## 时间序列填充
进行时间序列统计时，经常遇到时间空缺的场景，可以对空缺值进行自动填充：

**样例**
```js
var t = require('timeseries-stat').autofit;

var inputObj = {};
inputObj.month = ['2014-09','2015-09','2015-11'];
inputObj.income = [50,100001,98888];
inputObj.cost = [90,70001,78888];
t.fitTimeSeries4ArrayInObj(inputObj, {timeField: 'month'});
```

输出结果为：
```
 { month: 
   [ '2014-12',
     '2015-01',
     '2015-02',
     '2015-03',
     '2015-04',
     '2015-05',
     '2015-06',
     '2015-07',
     '2015-08',
     '2015-09',
     '2015-10',
     '2015-11' ],
  income: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 100001, 0, 98888 ],
  cost: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 70001, 0, 78888 ] }
```

另外也可以对下列格式内容进行数值填充
```
var input = [{month: '2015-09', income: 100001, cost: 70001},
    {month: '2015-11', income: 98888, cost: 78888}];
t.fitTimeSeries4ObjInArray(input,{timeField:'month'}));
```

输出结果为：
```
 [ { month: '2014-12', income: 0, cost: 0 },
  { month: '2015-01', income: 0, cost: 0 },
  { month: '2015-02', income: 0, cost: 0 },
  { month: '2015-03', income: 0, cost: 0 },
  { month: '2015-04', income: 0, cost: 0 },
  { month: '2015-05', income: 0, cost: 0 },
  { month: '2015-06', income: 0, cost: 0 },
  { month: '2015-07', income: 0, cost: 0 },
  { month: '2015-08', income: 0, cost: 0 },
  { month: '2015-09', income: 100001, cost: 70001 },
  { month: '2015-10', income: 0, cost: 0 },
  { month: '2015-11', income: 98888, cost: 78888 } ]
```