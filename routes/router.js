/**
 * Created by Swapnali on 03/05/2021.
 */
const express = require('express');
const foodItemController = require('./controller/foodItemController');
const foodOrderController = require('./controller/foodOrderController');
const passengerDetailsController = require('./controller/passengerDetailsController');
const newrouter = express.Router();

module.exports = () => {
    foodItemController(newrouter)
    foodOrderController(newrouter)
    passengerDetailsController(newrouter)
    return newrouter;
};
