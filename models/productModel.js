const Sequelize = require("sequelize");

const sequelize = require("../utils/database/dbconfig");

const Product = sequelize.define(
  "product",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    title: Sequelize.STRING,
    price: {
      type: Sequelize.DOUBLE,
      allowNull: false,
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    paranoid: true,
  }
);

Product.associate = (models) => {
  Product.belongsTo(models.userModel, { onDelete: "CASCADE" });
  Product.belongsToMany(models.cartModel, { through: models.cartitemModel });
};

module.exports = Product;