require("dotenv").config();

const parseDbUrl = (url) => {
  if (!url) return {};

  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      user: parsed.username,
      password: parsed.password,
      name: parsed.pathname ? parsed.pathname.replace(/^\//, "") : undefined,
      port: parsed.port,
    };
  } catch (error) {
    return {};
  }
};

const mysqlUrl = parseDbUrl(
  process.env.MYSQL_URL ||
    process.env.MYSQL_PUBLIC_URL ||
    process.env.MYSQLURL ||
    process.env.MYSQL_PUBLICURL
);

module.exports = {
  port: process.env.PORT || 5000,
  db: {
    host:
      process.env.DB_HOST ||
      process.env.MYSQLHOST ||
      process.env.MYSQL_HOST ||
      mysqlUrl.host,
    user:
      process.env.DB_USER ||
      process.env.MYSQLUSER ||
      process.env.MYSQL_USER ||
      mysqlUrl.user,
    password:
      process.env.DB_PASSWORD ||
      process.env.MYSQLPASSWORD ||
      process.env.MYSQL_PASSWORD ||
      mysqlUrl.password,
    name:
      process.env.DB_NAME ||
      process.env.MYSQLDATABASE ||
      process.env.MYSQL_DATABASE ||
      mysqlUrl.name,
    port:
      process.env.DB_PORT ||
      process.env.MYSQLPORT ||
      process.env.MYSQL_PORT ||
      mysqlUrl.port,
  },
  secretKey: process.env.JWT_SECRET,
};