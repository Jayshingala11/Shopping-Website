require("dotenv").config();
const { validationResult } = require("express-validator");
const models = require("../models/indexModel");
const Product = models.productModel;
const Cart = models.cartModel;
const Helper = require("../utils/Helper/authHelper");
const itemsPerPage = 2;

const stripe = require("stripe")(process.env.STRIPE_API_KEY);

class ShopController {
  getShopProducts = async (req, res, next) => {
    try {
      const page = +req.body.page || 1;
      const startLimit = (page - 1) * itemsPerPage;
      let ajax;
      if (req.body.isajax) {
        ajax = true;
      }

      const products = await Product.findAndCountAll({
        offset: startLimit,
        limit: itemsPerPage,
      });

      const totalPages = Math.ceil(products.count / itemsPerPage);

      const pagination = {
        totalPages,
        currentPage: page,
        itemsPerPage,
      };

      if (ajax) {
        return res
          .status(200)
          .json({ success: true, data: products, pagination });
      }

      res.render("products", {
        products,
        totalPages,
        isAuthenticated: res.locals.isAuthenticated,
      });
    } catch (error) {
      console.log(error);
    }
  };
  getCartPage = async (req, res, next) => {
    try {
      res.render("cart");
    } catch (error) {
      console.log(error);
    }
  };
  getOrders = async (req, res, next) => {
    try {
      const user = req.user;

      const orders = await user.getOrders({
        include: [
          {
            model: Product,
            paranoid: false,
          },
        ],
      });

      orders.forEach((order) => {
        order.products.forEach((product) => {
          const orderItem = product.orderItem;
          if (orderItem) {
            product.dataValues.quantity = orderItem.quantity;
          }
        });
      });

      res.render("order", { orders });
    } catch (error) {
      console.log(error);
    }
  };
  getaddProduct = async (req, res, next) => {
    try {
      res.render("add-product");
    } catch (error) {
      console.log(error);
    }
  };
  getAdminProducts = async (req, res, next) => {
    try {
      const userId = req.query.userId || req.user.id;

      const products = await Product.findAll({ where: { userId } });

      res.render("admin-products", { products });
    } catch (error) {
      console.log(error);
    }
  };
  postAddProduct = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (errors.errors.length !== 0) {
        return res
          .status(422)
          .render("add-product", { error: errors.errors[0].msg });
      }
      const { title, price, description } = req.body;
      const image = req.file;
      if (!image) {
        return res
          .status(422)
          .render("add-product", { error: "Please select an image" });
      }

      const product = new Product({
        title,
        price,
        description,
        imageUrl: image.path,
        userId: 12,
      });

      await product.save();

      res.redirect("/admin-products");
    } catch (error) {
      console.log(error);
    }
  };
  postEditProduct = async (req, res, next) => {
    try {
      const { prodId, title, price, description } = req.body;
      const image = req.file;

      const product = await Product.findByPk(prodId);
      product.title = title;
      product.price = price;
      product.description = description;
      if (image) {
        Helper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      await product.save();

      res.redirect("/admin-products");
    } catch (error) {
      console.log(error);
    }
  };
  postDeleteProduct = async (req, res, next) => {
    try {
      const { prodId } = req.body;

      const product = await Product.findByPk(prodId);

      Helper.deleteFile(product.imageUrl);

      await product.destroy();

      res.status(200).json({
        success: true,
        message: "Product Deleted Successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };
  getCart = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const cart = await Cart.findOne({ where: { userId } });

      const products = await cart.getProducts();

      res.status(200).json({ success: true, products });
    } catch (error) {
      console.log(error);
    }
  };
  addCart = async (req, res, next) => {
    try {
      const prodId = req.body.prodId;
      const userId = req.user.id;
      let newQuantity = req.body.quantity || 1;

      const cart = await Cart.findOne({ where: { userId } });

      const cartItems = req.body.cartItem || [];

      if (cartItems.length) {
        for (const cartItem of cartItems) {
          const prodId = cartItem.id;
          let newQuantity = +cartItem.quantity || 1;

          let products = await cart.getProducts({ where: { id: prodId } });

          if (products.length !== 0) {
            const oldQuantity = products[0].cartItem.quantity;
            newQuantity = oldQuantity + newQuantity;
          } else {
            products = await Product.findByPk(prodId);
          }

          await cart.addProduct(products, {
            through: { quantity: newQuantity },
          });
        }
      } else {
        let products = await cart.getProducts({ where: { id: prodId } });

        if (products.length !== 0) {
          const oldQuantity = products[0].cartItem.quantity;
          newQuantity = oldQuantity + newQuantity;
        } else {
          products = await Product.findByPk(prodId);
        }

        await cart.addProduct(products, {
          through: { quantity: newQuantity },
        });
      }

      res.status(200).json({ success: true, message: "Cart Item Added" });
    } catch (error) {
      console.log(error);
    }
  };
  deleteCartItem = async (req, res, next) => {
    try {
      const prodId = req.body.prodId;
      const userId = req.user.id;

      const cart = await Cart.findOne({ where: { userId } });

      const products = await cart.getProducts({ where: { id: prodId } });

      const product = products[0];

      const result = await product.cartItem.destroy();

      res.status(200).json({ success: true, message: "Cart Item Deleted" });
    } catch (error) {
      console.log(error);
    }
  };
  getCheckout = async (req, res, next) => {
    try {
      const userId = req.user.id;
      let totalPrice = 0;

      const cart = await Cart.findOne({ where: { userId } });
      const products = await cart.getProducts();

      products.forEach((prod) => {
        totalPrice += prod.price * prod.cartItem.quantity;
        prod.dataValues.quantity = prod.cartItem.quantity;
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map((p) => {
          return {
            price_data: {
              currency: "INR",
              product_data: {
                name: p.title,
                description: p.description,
              },
              unit_amount: p.price * 100,
            },
            quantity: p.cartItem.quantity,
          };
        }),
        mode: "payment",
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });

      res.render("checkout", { products, totalPrice, sessionId: session.id });
    } catch (error) {
      console.log(error);
    }
  };
  postOrder = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const cart = await Cart.findOne({ where: { userId } });

      const products = await cart.getProducts();

      const order = await req.user.createOrder();

      await order.addProducts(
        products.map((p) => {
          p.orderItem = { quantity: p.cartItem.quantity };
          return p;
        })
      );

      await cart.setProducts(null);

      res.redirect("/orders");
    } catch (error) {
      console.log(error);
    }
  };
}

module.exports = new ShopController();
