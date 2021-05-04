const moment = require('moment-timezone');
const foodOrderModel = require('../../model/foodOrderModel');
const foodItemModel = require('../../model/foodItemModel')
moment.tz.setDefault("Asia/Kolkata");
async = require("async"),
responseFormats = require('../../Utils/responseFormats.js'),

module.exports = class foodOrderService {

    async getFoodOrderList(callback){
        foodOrderModel.find({}).exec(function (err, data) {
            if (err) {
                return callback(err || "Error occured")
            } else {
                callback(null, data)
            }
        })
    }

    async getFoorOrderByPassengerId(data,callback){
        foodOrderModel.find({
            passengerId: data.passengerId
        }).exec(function (err, data) {
            if (err) {
                return callback(err || "Error occured")
            } else {
                callback(null, data)
            }
        })
    }

    async addFoodOrder(data, callback){
        async.waterfall([
            function(cb){
                data.selectedFoodItems.forEach(element => {
                    if(element.quantity == 0)
                    {
                        cb("Please provide quantity of Food Item.")
                    }else{
                    foodItemModel.find({
                        foodItem : element.foodItem
                    }).exec(function (err, foodItemData) {
                        if (err) {
                            cb(err || "Error occured")
                        } else {
                            if(foodItemData)
                            {
                                if(element.quantity > foodItemData[0].quantity)
                                {
                                    let message = "Selected Food Item available quantity is " + foodItemData[0].quantity +" , kindly change the order & submit again."
                                    cb(message)
                                }else
                                {
                                    foodItemModel.findOneAndUpdate({
                                        _id : foodItemData[0]._id
                                    },{
                                        $set :{
                                            quantity : foodItemData[0].quantity - element.quantity
                                        }
                                    },{
                                        upsert: false
                                    },
                                    function (err, result) {
                                        if (err || !result) {
                                            cb(err || "foodItemData not found")
                                        } else {
                                            cb(null, result)
                                        }
                                    });
                                }
                            }
                        }
                    })
                }
                });
            },function(result, cb)
            {
                if(result){
                var foodItem = new foodOrderModel(data);
                foodItem.save(function (err, post) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, post);
                    }
                })
            }}
        ],callback)
        
    }

    async updateFoodOrder(data, cb) {
        data = Object.assign(data, {
            "updatedAt": moment().valueOf()
        });
        var update = {
            $set : data
        };
        var condition = {};
        if (data._id) {
            condition = { _id: data._id };
        }
        else return cb("Data not found");
        foodOrderModel.findOneAndUpdate(condition, update,
            {
                upsert: false
            },
            function (err, data) {
                if (err || !data) {
                    return cb(err || "Data not found")
                } else {
                    return cb(null, data)
                }
            });
    }

    async deleteFoodOrder(data, cb) {
        var condition = {};
        if (data._id) {
            condition = { _id: data._id };
        }
        else return cb("Data not found");
        foodOrderModel.remove(condition,
            {
                upsert: false
            },
            function (err, data) {
                if (err || !data) {
                    return cb(err || "Data not found")
                } else {
                    return cb(null, data)
                }
            });
    }
}