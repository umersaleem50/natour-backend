const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utilities/catchAsync');
const User = require('../models/userModel');
const ApiError = require('../utilities/ApiError');

exports.signup = catchAsync(async (req, res, next) => {
  const userData = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
  });

  const token = jwt.sign({ id: userData._id }, process.env.JWT_SECURE_KEY, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });

  res.status(201).json({ status: 'success', token, data: userData });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //CHECKS IF EMAILS OR PASSWORDS ARE THERE
  if (!email || !password)
    return next(new ApiError('Please enter email and password!', 400));

  //CHECKS IF THERE IS USER WITH THAT PASSWORD
  const user = await User.findOne({ email }).select('+password');

  //IF USER ENTER CORRECT PASSWORD
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new ApiError('Please check your email or password!', 400));
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECURE_KEY, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new ApiError('Please Login first to get access this route!'),
      401
    );
  }

  //CHECK IF THE TOKEN IS VALID
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECURE_KEY);

  const currentUser = await User.findById(decode.id);

  if (!currentUser) {
    return next(
      new ApiError(`The user to whom the token is belong doesn't exists`, 401)
    );
  }

  if (currentUser.passwordChangedAfter(decode.iat)) {
    return next(
      new ApiError(`The user changed the password, Please login again!`, 401)
    );
  }

  req.user = currentUser;

  next();
});

exports.restrict =
  (...args) =>
  (req, res, next) => {
    if (!args.includes(req.user.role)) {
      return next(
        new ApiError(`You don't have permission to perform this task.`, 403)
      );
    }
    next();
  };
