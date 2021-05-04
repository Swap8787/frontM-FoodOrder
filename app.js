'use strict';
const express = require('express');
const logger = require('morgan');
const Router = require('./routes/router');
const app = express();
const moment = require('moment-timezone');
const helmet = require('helmet');
moment.tz.setDefault("Asia/Kolkata");

app.use(helmet())
logger.token('rawBody', function (req, res) {
    return req.rawBody;
});
app.use(logger(':date\t:remote-addr\t:method\t:url\t:rawBody\t:status\t:res[content-length]\t:response-time ms'));
app.use(express.json({
    limit: "100mb"
}));
app.use(express.json({
    limit: "100mb",
    verify: function (req, res, buf, encoding) {
        req.rawBody = buf.toString();
    },
    parameterLimit: 50000
}));

app.get('/status', (req, res) => {
    res.status(200).send({"msg":"Success"});
});
app.head('/status', (req, res) => {
    res.status(200).send({"msg":"Success"});
});

app.use('/', Router());

/// catch 404 and forward to error handler
app.use((req, res, next) => {
    res.status(404).json({
        "status": 404,
        "msg": 'Not Found'
    });
});

/// error handlers
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        return res
            .status(err.status)
            .send({
                message: err.message
            })
            .end();
    }
    return next(err);
});
app.use((err, req, res, next) => {
    console.log("Error : ", err);
    if (typeof err === 'string') {
        res.status(err.status || 500).json({
            "status": err.status || 500,
            "msg": err || "Internal Server Error",
            "errors": err.errors || []
        });
    } else if (err.msg == 'Invalid Inputs' && err.errors) {
        let msg = "Please enter valid ", fields = [];
        err.errors.forEach(element => {
            var field = element.param.trim();
            field = utils.camelizeSeperator(field);
            field = field.replace(constants.regex.camelCaseSeperatorRegex, '$1 $2');
            fields.push(field);
        });
        return res.status(400).json({
            "status": 400,
            "msg": msg + fields.join(", "),
            "errors": err.errors
        })
    }
    else {
        if (err && err.errors && err.errors.name && err.errors.name === 'MongoError') {
            if (err.errors.code === 11000) {
                
                return res.status(400).json({
                    "status": 400,
                    "msg": 'Record already exists',
                    "error": 'Record already exists'
                })
            } else {
                return res.status(500).json({
                    "status": 500,
                    "msg": 'Internal server error',
                    "error": err
                })
            }
        }
        else {
            res.status(err.status || 500).json({
                "status": err.status || 500,
                "msg": err.msg || "Internal Server Error",
                "errors": err.errors || [],
                "response_code": err.response_code || [],
                "data": err.data || [],
            });
        }
    }
});

module.exports = app;