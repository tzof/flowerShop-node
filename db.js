var mysql = require("mysql2")

var pool = mysql.createPool({
	host: "localhost",
	user: "root",
	password: "psd.",
	database: "floweShop",
	port: "3306"
})

module.exports = pool;