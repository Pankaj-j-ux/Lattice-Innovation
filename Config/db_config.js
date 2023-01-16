/** @format */

const mysql = require("mysql");

try {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DB,
    connectionLimit: 10,
  });

  console.log("Database Connected Successfully !");
  module.exports = pool;
} catch (err) {
  console.log("Error in Connectivity with the database !");
  console.log("Error Message : ", err);
}
