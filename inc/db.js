const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'luca',
    database: 'saboroso',
    password: '#Ln131313!???',
    multipleStatements: true
  });

  module.exports = connection;