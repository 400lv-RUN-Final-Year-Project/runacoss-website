const User = require("../models/userModel");
exports.findUserByEmail = (email) => User.findOne({ email });
exports.createUser = (userData) => new User(userData).save();
