const express = require("express");
const authController = require("../controllers/authController");
const AuthValidation = require("../utils/validation/authValidation");
const Auth = require("../utils/Helper/authHelper");

const router = express.Router();

router.get("/signup", Auth.isLogout, authController.getSignup);

router.post(
  "/postSignup",
  Auth.isLogout,
  AuthValidation.validatesignup,
  authController.postSignup
);

router.get("/login", Auth.isLogout, authController.getLogin);

router.post(
  "/postLogin",
  AuthValidation.validateLogin,
  authController.postLogin
);

router.post("/logout", Auth.isLogin, authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/getnew-password", authController.getNewPassword);

router.post("/postnew-password", authController.postNewPassword);

module.exports = router;