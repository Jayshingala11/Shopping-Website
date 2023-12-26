require("dotenv").config();
const fs = require("fs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

class AuthHelper {
  validateRequest = async (req) => {
    // const errors = validationResult(req);
    // console.log("errors ==>:::", errors);
    // // if (!errors.isEmpty()) {
    // //   const error = new Error("Validation Failed.");
    // //   error.statusCode = 422;
    // //   error.data = errors.array();
    // //   return error;
    // // }
    // return errors;
  };

  async generateToken(body, expiresIn) {
    return new Promise((resolve, reject) => {
      let token = jwt.sign(
        {
          data: body,
        },
        secret,
        { expiresIn: expiresIn }
      );

      resolve(token);
    });
  }

  deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        throw err;
      }
    });
  };

  isLogin = (req, res, next) => {
    try {
      if (req.session.isLoggedIn) {
        next();
      } else {
        res.redirect("/auth/login");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  isLogout = async (req, res, next) => {
    try {
      if (req.session.user) {
        res.redirect("/admin-products");
      }
      next();
    } catch (error) {
      console.log(error.message);
    }
  };
}

module.exports = new AuthHelper();