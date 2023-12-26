const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const models = require("../models/indexModel");
const User = models.userModel;
const Helper = require("../utils/Helper/authHelper");

class AuthController {
  getLogin = async (req, res, next) => {
    try {
      res.render("login");
    } catch (error) {
      console.log(error);
    }
  };

  getSignup = async (req, res, next) => {
    try {
      res.render("signup");
    } catch (error) {
      console.log(error);
    }
  };

  postLogin = async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (errors.errors.length !== 0) {
        return res
          .status(200)
          .json({ success: false, error: errors.errors[0].msg });
      }
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        console.log("In user");
        return res
          .status(200)
          .json({ success: false, error: "Invalid email or password!" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("In isMatch");
        return res
          .status(200)
          .json({ success: false, error: "Invalid email or password!" });
      }

      req.session.isLoggedIn = true;
      req.session.user = user;
      await req.session.save((err) => {
        console.log(err);
      });

      res
        .status(200)
        .json({ success: true, msg: "Login Successfull.", data: user.id });
    } catch (error) {
      console.log(error);
    }
  };

  postSignup = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (errors.errors.length !== 0) {
        return res
          .status(200)
          .json({ success: false, error: errors.errors[0].msg });
      }

      const { name, email, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        name,
        email,
        password: hashedPassword,
      });

      const newUser = await user.save();

      await newUser.createCart();

      res.status(200).json({ success: true, msg: "Signup Successfull" });
    } catch (error) {
      console.log(error);
    }
  };

  postLogout = async (req, res, next) => {
    try {
      await req.session.destroy((err) => {
        res.redirect("/");
      });
    } catch (error) {
      console.log(error);
    }
  };
  getReset = async (req, res, next) => {
    try {
      res.render("reset");
    } catch (error) {
      console.log(error);
    }
  };
  postReset = async (req, res, next) => {
    try {
      const email = req.body.email;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res
          .status(200)
          .json({ success: false, error: "No user found!" });
      }

      const token = await Helper.generateToken(user.email, "1h");

      res.status(200).json({ success: true, token });
    } catch (error) {
      console.log(error);
    }
  };
  getNewPassword = async (req, res, next) => {
    try {
      const token = req.cookies.Token;
      res.render("new-password", { token });
    } catch (error) {
      console.log(error);
    }
  };
  postNewPassword = async (req, res, next) => {
    try {
      const {email, newPassword} = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res
          .status(200)
          .json({ success: false, error: "No user found!" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
    
      user.password = hashedPassword;

      await user.save();

      res.status(200).json({ success: true, msg: "Password Updated!" });
    } catch (error) {
      console.log(error);
    }
  };
}
module.exports = new AuthController();
