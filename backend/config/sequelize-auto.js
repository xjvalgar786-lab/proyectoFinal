const SequelizeAuto = require("sequelize-auto");
const config = require('./config');

const auto = new SequelizeAuto(
  config.db.name, 
  config.db.user, 
  config.db.password, 
  {
    host: config.db.host,
    port: config.db.port,
    dialect: "mysql",
    directory: "./models",
    caseModel: 'c', 
    caseFile: "c", 
    additional: {
      timestamps: false,
      
    },
    
  }
);

auto.run().then((data) => {
  console.log(data.tables); 
  console.log(data.text); 
});