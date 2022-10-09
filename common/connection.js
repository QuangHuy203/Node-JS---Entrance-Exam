var mysql = require('mysql');
const { MYSQL_CONFIG } = require('./constants');

var connection = mysql.createConnection(MYSQL_CONFIG);

connection.connect((err)=> {
    if (err) console.log('Could not connect to the database!');
});

module.exports = connection;