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

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

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

// exports.createUser = (req, res) => {
//   res
//     .status(500)
//     .json({ status: 'error', message: 'This route need to be implement' });
// };

exports.getUser = factory.getOne(User);

exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
