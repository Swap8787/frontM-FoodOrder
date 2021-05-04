/**
 * Created by Swapnali on 03/05/2021.
 */
var route = require('express').Router();
const moment = require('moment-timezone');
const responseFormats = require('../../Utils/responseFormats');
moment.tz.setDefault("Asia/Kolkata");
const passengerDetailsService = require("../services/passengerDetailsService")
module.exports = (apps) => {
    apps.use('/passengerDetails', route);

    route.get('/getDetailsBySeatNo', function (req, res, next) {
        let passengerDetailsSer = new passengerDetailsService()
        passengerDetailsSer.getPassengerDetailsBySeatNo(req.query, function (err, post) {
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
        let passengerDetailsSer = new passengerDetailsService()
        passengerDetailsSer.addPassengerDetails(req.body, function (err, post) {
            if (err) {
                return next({ msg: err || responseFormats.message.serverError, errors: err, status: 500 });
            }
            else if (!post) {
                return next({ msg: err || responseFormats.message.passengerDetailsAddError, data: [], status: 202 });
            } else {
                    res.status(200).send({ "status": 200, msg: responseFormats.message.passengerDetailsAddSuccess, data: {} });
            }
        });
    })

    route.post('/update', function (req, res, next) {
        let passengerDetailsSer = new passengerDetailsService()
        passengerDetailsSer.updatePassengerDetails(req.body, function (err, post) {
            if (err) {
                return next({ msg: err.msg || responseFormats.message.serverError, errors: err, status: 500 });
            }
            else if (!post) {
                return next({ msg: err || responseFormats.message.dataNotFound, data: [], status: 202 });
            } else {
                res.status(200).send({ "status": 200, msg: responseFormats.message.passengerDetailsUpdateSuccess});
            }
        })
    })
}