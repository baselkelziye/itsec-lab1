const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost', //location of the db server
  database: 'blog', // db name
  user: 'root',
  password: '12345678',
});

module.exports = pool;
