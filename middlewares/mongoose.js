const mongoose = require('mongoose');
var config = require('../app-config');
const frontMDB = config.mongoDbURI;

module.exports = {
    frontMDB: mongoose.createConnection(frontMDB, {
        useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false 
    }, function (err, connections) {
        if (err) {
            console.error("frontM DB Connection Error" + err)
            process.exit(1)
        } else {
            console.log("frontM DB connected successfully");
            return connections;
        }
    }),
};