var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , statUtils = require('timeseries-stat')

    ;

//var db = 'mongodb://jfjun_test:jfjun12qw@120.26.68.22:27017/jfjun_test';
var db = 'mongodb://localhost:27017/test';

var OrderSchema = new Schema(
    {
        totalFee: {type: Number},     //价格，需要支付的钱
        product: {type: String, required: true}, //产品id
        createdAt: {type: Date, default: Date.now},        // 创建时间
    }, {versionKey: false}
);
/**
 * 加载数据
 * @param msg
 * @param callback
 */
function loadData(callback) {
    mongoose.connect(db, null, function (err) {
        if (err) {
            return console.log('connect to db failed', db, err);
        }
        var Order = mongoose.model("Order", OrderSchema, 'order4testtimeseries');
        var orderList =
            [
                {
                    totalFee: 5000,
                    product: 'iphone6',
                    createdAt: new Date("2015-09-15T03:00:00.000Z")
                },
                {
                    totalFee: 5000,
                    product: 'iphone6',
                    createdAt: new Date("2015-10-15T03:00:00.000Z")
                },
                {
                    totalFee: 5000,
                    product: 'iphone6',
                    createdAt: new Date("2015-11-12T03:00:00.000Z")
                },
                {
                    totalFee: 4500,
                    product: 'iphone6',
                    createdAt: new Date("2015-11-15T03:00:00.000Z")
                },
                {
                    totalFee: 6000,
                    product: 'iphone6s',
                    createdAt: new Date("2015-11-15T03:00:00.000Z")
                },
                {
                    totalFee: 6000,
                    product: 'iphone6s',
                    createdAt: new Date("2015-11-17T03:00:00.000Z")
                },
                {
                    totalFee: 6000,
                    product: 'iphone6s',
                    createdAt: new Date()
                }
            ];
        Order.remove(function (err, result) {
            if (err)
                return console.log('remove db failed', err);

            Order.collection.insert(orderList, function onInsert(err, docs) {
                if (err) {
                    return console.log('insert to db failed', db, err);
                }
                timeseriesTest(Order);
            });
        });
    });
};

/**
 * 测试时间序列统计查询
 * @param model
 */
var timeseriesTest = function(model)
{
    statUtils.statByTime(model, {unit: 'month', reduceFields: ['totalFee']}, function (err, results) {
        console.info('no padding result\n', results);
    })

    statUtils.statByTime(model, {
        unit: 'month',
        reduceFields: ['totalFee']
    }, function (err, results) {
        console.info('padding result\n', results);
    })
    statUtils.statByTime(model, {
        unit: 'day',
        reduceFields: ['totalFee'],
        //query: {product: 'iphone6'}
    }, function (err, results) {
        console.info('padding with query result\n', results);
    })
}

loadData();