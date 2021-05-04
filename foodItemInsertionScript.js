const fs = require('fs');
let foodItemData = fs.readFileSync('../frontM-FoodOrder/public/foodItemData.js')
const foodItemModel =require('../frontM-FoodOrder/model/foodItemModel')
let foodItems = JSON.parse(foodItemData);  
// db.city.insertMany(cities)  using mongo client 
// City.insertMany(cities)  using Mongoose
foodItemModel.insertMany(foodItems,(err, res) => {
    if (err) throw err;
    console.log(`Inserted: ${res.length} rows`);
  });