const mongoose = require('mongoose');
const validator = require('validator');

const userModel = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    require: [true, 'Please provide an email'],
    unique: true,
    lowerCase: true,
    validate: validator.isEmail,
  },
  image: {
    type: String,
  },
  password: {
    type: String,
    require: [true, 'Please provide a password'],
    minLength: 8,
  },
  confirmPassword: {
    type: String,
    require: [true, 'Please confirm your password'],
  },
});

const User = mongoose.Model('User', userModel);

module.exports = User;
