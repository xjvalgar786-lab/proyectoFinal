require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

module.exports = {
  port: process.env.PORT || 5000,
  db: {
    host: process.env.DB_HOST || process.env.MYSQLHOST,
    user: process.env.DB_USER || process.env.MYSQLUSER,
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    name: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE,
    port: process.env.DB_PORT || process.env.MYSQLPORT,
  },
  secretKey: process.env.JWT_SECRET || "default_secret",
};

console.log("DBNAME:",process.env.DB_NAME);
console.log("DBHOST:",process.env.DB_HOST);
console.log("DBUSER:",process.env.DB_USER);
console.log("DBPORT:",process.env.DB_PORT);
console.log("NODE_ENV:",process.env.NODE_ENV);
console.log("process.env.JWT_SECRET:",process.env.JWT_SECRET);
