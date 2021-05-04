/**
 * Created by Swapnali on 03/05/2021.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Kolkata");

const db = require('../middlewares/mongoose');
/* Schema For Passenger Details */
const passengerDetailsSchema = new Schema({
    firstName:{type: String, required: true},
    lastName : {type: String, required: true},
    seatNo : {type: String, required: true},
    updatedAt: { type: Number, default: () => moment().valueOf() },
    addedAt: { type: Number, default: () => moment().valueOf()}
 }, {collection: 'passengerDetails'});

const passengerDetailsModel = db.frontMDB.model('passengerDetails', passengerDetailsSchema);

module.exports = passengerDetailsModel;