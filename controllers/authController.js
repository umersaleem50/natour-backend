const catchAsync = require('../utilities/catchAsync');
const User = require('../models/userModel');

exports.signup = catchAsync(async (req, res, next) => {
  const userData = await User.create(req.body);
  res.status(201).json({ status: 'success', data: userData });
});
