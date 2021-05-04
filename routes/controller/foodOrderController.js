/**
 * Created by Swapnali on 03/05/2021.
 */
var route = require('express').Router();
const moment = require('moment-timezone');
const responseFormats = require('../../Utils/responseFormats');
moment.tz.setDefault("Asia/Kolkata");
const foodOrderService = require("../services/foodOrderService")
module.exports = (apps) => {
    apps.use('/foodOrder', route);

    route.get('/getFoodOrderList', function (req, res, next) {
        let foodOrderSer = new foodOrderService()
        foodOrderSer.getFoodOrderList(function (err, post) {
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

    route.get('/getFoorOrderByPassengerId', function (req, res, next) {
        let foodOrderSer = new foodOrderService()
        foodOrderSer.getFoorOrderByPassengerId(req.query, function (err, post) {
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

    route.post('/addFoodOrder', function (req, res, next) {
        let foodOrderSer = new foodOrderService()
        foodOrderSer.addFoodOrder(req.body, function (err, post) {
            if (err) {
                return next({ msg: err || responseFormats.message.serverError, errors: err, status: 500 });
            }
            else if (!post) {
                return next({ msg: err || responseFormats.message.FoodOrderAddError, data: [], status: 202 });
            } else {
                res.status(200).send({ "status": 200, msg: responseFormats.message.FoodOrderAddSuccess, data: {} });
            }
        });
    })

    route.post('/updateFoodOrder', function (req, res, next) {
        let foodOrderSer = new foodOrderService()
        foodOrderSer.updateFoodOrder(req.body, function (err, post) {
            if (err) {
                return next({ msg: err.msg || responseFormats.message.serverError, errors: err, status: 500 });
            }
            else if (!post) {
                return next({ msg: err || responseFormats.message.dataNotFound, data: [], status: 202 });
            } else {
                res.status(200).send({ "status": 200, msg: responseFormats.message.FoodOrderUpdateSuccess });
            }
        })
    })

    route.post('/deleteFoodOrder', function (req, res, next) {
        let foodOrderSer = new foodOrderService()
        foodOrderSer.deleteFoodOrder(req.body, function (err, post) {
            if (err) {
                return next({ msg: err.msg || responseFormats.message.serverError, errors: err, status: 500 });
            }
            else if (!post) {
                return next({ msg: err || responseFormats.message.dataNotFound, data: [], status: 202 });
            } else {
                res.status(200).send({ "status": 200, msg: responseFormats.message.FoodOrderDeleteSuccess });
            }
        })
    })
}