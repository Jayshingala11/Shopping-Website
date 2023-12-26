const Sequelize = require("sequelize");

const sequelize = require("../utils/database/dbconfig");

const Cart = sequelize.define("cart", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

Cart.associate = (models) => {
  Cart.belongsTo(models.userModel);
  Cart.belongsToMany(models.productModel, { through: models.cartitemModel });
};

module.exports = Cart;