const mysql = require("mysql")

var connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'chawin007',
    database: 'vacCenter'
});

module.exports = connection;