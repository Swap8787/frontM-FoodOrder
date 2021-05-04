const moment = require('moment-timezone');
const passengerDetailsModel = require('../../model/passengerDetailsModel');
moment.tz.setDefault("Asia/Kolkata");
async = require("async"),
responseFormats = require('../../Utils/responseFormats.js'),

module.exports = class passengerDetailsService {

    async getPassengerDetailsBySeatNo(data,callback){
        passengerDetailsModel.find({
            seatNo: data.seatNo
        }).exec(function (err, data) {
            if (err) {
                return callback(err || "Error occured")
            } else {
                callback(null, data)
            }
        })
    }

    async addPassengerDetails(data, callback){
        var passengerDetails = new passengerDetailsModel(data);
        passengerDetails.save(function (err, post) {
            if (err) {
                callback(err);
            } else {
                callback(null, post);
            }
        })
    }

    async updatePassengerDetails(data, cb) {
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
        passengerDetailsModel.findOneAndUpdate(condition, update,
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