const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password are not same!',
    },
  },
});

userSchema.pre('save', async function (next) {
  //Only run if password is being create or update
  if (!this.isModified('password')) return next();

  //this will hast the password
  this.password = await bcrypt.hash(this.password, 12);

  //this will set confirm password to undefined
  this.confirmPassword = undefined;

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
