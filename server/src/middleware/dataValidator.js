const {body, validationResult} = require("express-validator");

//Validation and Santination Middleware
const validateUser = [
  //validation and sanitize email
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),

  //validation and sanitize firstName
  body("firstName").trim().escape().notEmpty().withMessage("First name is required"),

  //validation and sanitize lastName
  body("lastName").trim().escape().notEmpty().withMessage("Last name is required"),

  //validation and sanitize password
  body("password").trim().escape().isLength({min: 6}).withMessage("Password must be at lease 6 characters long"),

  //validation and sanitize verificationToken (if provided)
  body("verificationToken").optional().trim().escape().notEmpty().withMessage("verification is required"),

  //check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).json({errors: errors.array()});
    }
    next();
  }
];
//Export the middleware
module.exports = validateUser;
// const User = require("../models/userModel");
// const generateOtp = require("../helpers/generateRandomToken");
//     await User.deleteOne({ _id: userExistForVerification._id });