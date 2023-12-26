const Sequelize = require("sequelize");

const sequelize = require("../utils/database/dbconfig");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  resetToken: {
    type: Sequelize.STRING,
  },
  resetTokenExpiration: Sequelize.DATE,
});

User.associate = (models) => {
  User.hasMany(models.productModel, { onDelete: "CASCADE" });
  User.hasOne(models.cartModel);
  User.hasMany(models.orderModel);
};

module.exports = User;