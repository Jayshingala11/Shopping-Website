const express = require("express");

const shopController = require("../controllers/shopController");
const Validation = require("../utils/validation/authValidation");
const Auth = require("../utils/Helper/authHelper");

const router = express.Router();

router.get("/", shopController.getShopProducts);

router.post("/", shopController.getShopProducts);

router.get("/cart", shopController.getCartPage);

router.get("/getCart", Auth.isLogin, shopController.getCart);

router.get("/orders", Auth.isLogin, shopController.getOrders);

router.get("/add-product", Auth.isLogin, shopController.getaddProduct);

router.post("/add-product", Auth.isLogin, Validation.validateProduct, shopController.postAddProduct);

router.get("/admin-products", Auth.isLogin, shopController.getAdminProducts);

router.post("/edit-product", Auth.isLogin, Validation.validateProduct, shopController.postEditProduct);

router.post("/delete-product", Auth.isLogin, shopController.postDeleteProduct);

router.post("/add-cart", Auth.isLogin, shopController.addCart);

router.delete("/delete-cartItem", Auth.isLogin, shopController.deleteCartItem);

router.get("/checkout", Auth.isLogin, shopController.getCheckout);

router.get('/checkout/success', Auth.isLogin, shopController.postOrder);

module.exports = router;