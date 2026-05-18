const SequelizeAuto = require("sequelize-auto");
const config = require('./config');

const auto = new SequelizeAuto(
  process.env.DATABASE_URL,
  {
    dialect: "mysql",
    directory: "./models",
    caseModel: "c",
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