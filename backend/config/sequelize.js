const { Sequelize } = require("sequelize");
// Importar fichero de configuración con variables de entorno
const config = require("./config");

// Instanciar sequelize  para conectar a mysql
const sequelize = new Sequelize(process.env.MYSQL_URL, {
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