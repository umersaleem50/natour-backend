const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const ApiError = require('../utilities/ApiError');
const factory = require('./handleFactory');

const filterData = (obj, ...filterEl) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (filterEl.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ status: 'success', data: { users } });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new ApiError(
        `You're not allowed to change password here, Please visit /updateMyPassword`,
        400
      )
    );
  }

  const filteredData = filterData(req.body, 'name', 'email');

  const user = await User.findByIdAndUpdate(req.user.id, filteredData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: user });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success', data: {} });
});

exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route need to be implement' });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: `This route is't implemented. Please go to /login instead`,
  });
};

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
