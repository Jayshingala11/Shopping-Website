require('dotenv').config();
const Sequelize = require("sequelize");

const sequelize = new Sequelize("practical_test", "root", process.env.DB_PASS, {
  dialect: "mysql",
  host: "localhost",
  timezone: "+05:30",
  logging: false,
});

module.exports = sequelize;