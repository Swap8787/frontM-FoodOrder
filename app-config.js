var env = process.env.NODE_ENV || "local";

const local = {
    baseurl: "https://localhost",
    port: 3000,
    mongoDbURI: 'mongodb://localhost:27017/frontm'
};

const config = {
    local: local
};
module.exports = config[env];

