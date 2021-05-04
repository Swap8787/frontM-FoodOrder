/**
 * Created by Swapnali on 03/05/2021.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Kolkata");

const db = require('../middlewares/mongoose');
/* Schema For Food Item */
const foodItemSchema = new Schema({
    foodItem: {type: String, required : true}, 
    foodItemType:{type: String, required : true},
    cuisine : {type: String, required : true},
    cost : {type: Number, required : true},
    quantity :{type: Number, required : true},
    updatedAt: { type: Number, default: () => moment().valueOf() },
    addedAt: { type: Number, default: () => moment().valueOf()}
 }, {collection: 'foodItem'});

const foodItemModel = db.frontMDB.model('foodItem', foodItemSchema);
db.frontMDB.collection("foodItem").createIndex({ foodItemType: 1,foodItem: 1 }, { unique: true })

module.exports = foodItemModel;