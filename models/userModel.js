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
  role: {
    type: String,
    enum: ['admin', 'lead-guide', 'guide', 'user'],
    default: 'user',
  },
  password: {
    type: String,
    require: [true, 'Please provide a password'],
    minLength: 8,
    select: false,
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
  passwordChangedAt: {
    type: Date,
    default: new Date(),
    select: false,
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

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangedStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    if (passwordChangedStamp > JWTTimeStamp) return true;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
