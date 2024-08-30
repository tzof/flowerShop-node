const mysql = require("mysql2/promise")

const pool = mysql.createPool({
	host: "host",
	user: "root",
	password: "password",
	database: "database",
	port: "3306"
})

module.exports = pool;