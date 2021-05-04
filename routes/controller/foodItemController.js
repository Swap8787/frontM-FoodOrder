/**
 * Created by Swapnali on 03/05/2021.
 */
var route = require('express').Router();
const moment = require('moment-timezone');
const responseFormats = require('../../Utils/responseFormats');
moment.tz.setDefault("Asia/Kolkata");
const foodItemService = require("../services/foodItemService");
const datatablesFoodItem = require('../../Utils/data-table_foodItem');
const foodItemModel = require('../../model/foodItemModel');
module.exports = (apps) => {
    apps.use('/foodItem', route);

    route.post('/pagination', function (req, res, next) {
        var params = req.body;
        var query = datatablesFoodItem(foodItemModel);
        query.run(params).then(function (data) {
            res.status(200).send(data);
        }, function (err) {
            return next({
                msg: err || responseFormats.message.serverError,
                errors: err,
                status: 500
            });
        });
    })

    route.get('/getListByFoodItemType', function (req, res, next) {
        let foodItemSer = new foodItemService()
        foodItemSer.getListByFoodItemType(req.query, function (err, post) {
            if (err) {
                return next({ msg: err.msg || responseFormats.message.serverError, errors: err, status: 500 });
            }
            else if (post.length <= 0) {
                return next({ msg: err || responseFormats.message.dataNotFound, data: [], status: 202 });
            } else {
                res.status(200).send({ "status": 200, msg: responseFormats.message.dataFound, data: post });
            }
        })
    })

    route.post('/add', function (req, res, next) {
        let foodItemSer = new foodItemService()
        foodItemSer.addFoodItem(req.body, function (err, post) {
            if (err) {
                return next({ msg: err || responseFormats.message.serverError, errors: err, status: 500 });
            }
            else if (!post) {
                return next({ msg: err || responseFormats.message.FoodItemAddError, data: [], status: 202 });
            } else {
                res.status(200).send({ "status": 200, msg: responseFormats.message.FoodItemAddSuccess, data: {} });
            }
        });
    })

    route.post('/update', function (req, res, next) {
        let foodItemSer = new foodItemService()
        foodItemSer.updateFoodItem(req.body, function (err, post) {
            if (err) {
                return next({ msg: err.msg || responseFormats.message.serverError, errors: err, status: 500 });
            }
            else if (!post) {
                return next({ msg: err || responseFormats.message.dataNotFound, data: [], status: 202 });
            } else {
                res.status(200).send({ "status": 200, msg: responseFormats.message.FoodItemUpdateSuccess });
            }
        })
    })

    route.post('/delete', function (req, res, next) {
        let foodItemSer = new foodItemService()
        foodItemSer.deleteFoodItem(req.body, function (err, post) {
            if (err) {
                return next({ msg: err.msg || responseFormats.message.serverError, errors: err, status: 500 });
            }
            else if (!post) {
                return next({ msg: err || responseFormats.message.dataNotFound, data: [], status: 202 });
            } else {
                res.status(200).send({ "status": 200, msg: responseFormats.message.FoodItemDeleteSuccess });
            }
        })
    })
}