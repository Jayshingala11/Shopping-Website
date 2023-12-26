const Sequelize = require("sequelize");

const sequelize = require("../utils/database/dbconfig");

const Order = sequelize.define("order", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

Order.associate = (models) => {
  Order.belongsTo(models.userModel);
  Order.belongsToMany(models.productModel, {
    through: models.orderitemModel,
  });
};

module.exports = Order;