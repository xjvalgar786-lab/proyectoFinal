const { Sequelize } = require("sequelize");
// Importar fichero de configuración con variables de entorno
const config = require("./config");

const MYSQL_URL="mysql://root:hALRPbpoizlNaTkikCGrcBcomdzBgZDC@trolley.proxy.rlwy.net:39022/railway";

// Instanciar sequelize  para conectar a mysql
const sequelize = new Sequelize(MYSQL_URL, {
  dialect: "mysql",
  logging: false,
});

// Probar la conexión
(async () => {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV !== "test") {
      console.log("Conexión exitosa a la base de datos MySQL");
    }
  } catch (error) {
    console.error("Error de conexión:", error);
  }
})();

module.exports = sequelize; 