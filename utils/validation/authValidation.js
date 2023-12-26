const { body } = require("express-validator");
const models = require("../../models/indexModel");
const User = models.userModel;

class AuthValidation {
  validatesignup = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email")
      .isEmail()
      .withMessage("Please enetr a valid emial")
      .custom((value, { req }) => {
        return User.findOne({ where: { email: value } }).then((user) => {
          if (user) {
            return Promise.reject("Email already exists.");
          }
        });
      }),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters!"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to match!");
        }
        return true;
      }),
  ];

  validateLogin = [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail()
      .not()
      .isEmpty(),
    body("password", "please enter atleast 5 charachter.")
      .trim()
      .isLength({ min: 5 })
      .not()
      .isEmpty(),
  ];

  validateProduct = [
    body("title", "Enter title atleast 3 character!").isString().isLength({ min: 3 }).trim().notEmpty(),
    body("price", "Enter price in number!").isNumeric().notEmpty(),
    body("description", "Enter description atleast 8 character!").isLength({ min: 8 }).trim().notEmpty(),
  ];
}

module.exports = new AuthValidation();