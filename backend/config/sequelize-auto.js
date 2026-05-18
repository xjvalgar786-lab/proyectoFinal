const SequelizeAuto = require("sequelize-auto");
const config = require('./config');

const MYSQL_URL="mysql://root:hALRPbpoizlNaTkikCGrcBcomdzBgZDC@trolley.proxy.rlwy.net:39022/railway";
const auto = new SequelizeAuto(
  MYSQL_URL,
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