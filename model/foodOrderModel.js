/**
 * Created by Swapnali on 03/05/2021.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Kolkata");

const db = require('../middlewares/mongoose');
/* Schema For Food Order */
const foodOrderSchema = new Schema({
    selectedFoodItems:{type: Array, required: true},
    passengerId : {
        type: Schema.Types.ObjectId, 
        ref: 'passengerDetails',
        required: true},
    totalAmount : {type: Number, required: true},
    modeOfPayment: {type: String, default: "Credit card"},
    paymentStatus : {type: String, default: "Done"},
    orderStatus:{type: String, default:"Order Accepted"},
    updatedAt: { type: Number, default: () => moment().valueOf() },
    addedAt: { type: Number, default: () => moment().valueOf()}
 }, {collection: 'foodOrder'});

const foodOrderModel = db.frontMDB.model('foodOrder', foodOrderSchema);

module.exports = foodOrderModel;