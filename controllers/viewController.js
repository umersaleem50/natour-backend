const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const ApiError = require('../utilities/ApiError');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { tourSlug } = req.params;
  const tour = await Tour.findOne({ slug: tourSlug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) return next(new ApiError('No tour found with this name!', 404));
  //2) Build template

  //3) Render data of 1)

  res
    .status(200)
    // .json({ status: 'success', tour });
    .render('tour', {
      title: 'The Forest Hiker Tour',
      tour,
    });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login into your account',
  });
});

exports.userAccount = (req, res, next) => {
  res.status(200).render('account', {
    title: 'User account',
  });
};

exports.updateUserSettings = catchAsync(async (req, res, next) => {
  console.log(req.body);

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'User account',
    user: updatedUser,
  });
});
