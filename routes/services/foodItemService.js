const moment = require('moment-timezone');
const foodItemModel = require('../../model/foodItemModel');
moment.tz.setDefault("Asia/Kolkata");
async = require("async"),
responseFormats = require('../../Utils/responseFormats.js'),

module.exports = class foodItemService {

    async getListByFoodItemType(data,callback){
        foodItemModel.find({
            foodItemType: data.foodItemType,
            quantity:{$gte : 1}
        }).exec(function (err, data) {
            if (err) {
                return callback(err || "Error occured")
            } else {
                callback(null, data)
            }
        })
    }

    async addFoodItem(data, callback){
        var foodItem = new foodItemModel(data);
        foodItem.save(function (err, post) {
            if (err) {
                callback(err);
            } else {
                callback(null, post);
            }
        })
    }

    async updateFoodItem(data, cb) {
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
        foodItemModel.findOneAndUpdate(condition, update,
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

    async deleteFoodItem(data, cb) {
        var condition = {};
        if (data._id) {
            condition = { _id: data._id };
        }
        else return cb("Data not found");
        foodItemModel.remove(condition,
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