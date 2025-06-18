require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306 // Default MySQL port
});

connection.connect((err) => {
  if (err) console.error('MySQL Error:', err);
  else console.log('✅ MySQL connected');
});

module.exports = connection;
