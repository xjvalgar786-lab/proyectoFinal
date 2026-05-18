const { Sequelize } = require("sequelize");
// Importar fichero de configuración con variables de entorno
const config = require("./config");

const { host, user, password, name, port } = config.db;

if (!host || !user || !password || !name || !port) {
  console.error("DB CONFIG INCOMPLETE:", config.db);
}

// Instanciar sequelize  para conectar a mysql
const sequelize = new Sequelize(
  name, // nombre bd
  user, // usuario
  password, // password
  {
    // objeto con opciones de conexion
    host, // Cambia esto por la dirección del servidor MySQL
    port, // Cambia esto por el puerto del servidor MySql
    dialect: "mysql", // Especificar el dialecto de la base de datos
    logging: false, // Desactiva el logging de las consultas SQL
  }
);

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