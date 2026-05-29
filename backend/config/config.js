require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5000,
  db: {
    host: process.env.DB_HOST || process.env.MYSQLHOST,
    user: process.env.DB_USER || process.env.MYSQLUSER,
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    name: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE,
    port: process.env.DB_PORT || process.env.MYSQLPORT,
  },
  secretKey: process.env.JWT_SECRET,
};

console.log("process.env.JWT_SECRET:",process.env.JWT_SECRET);
