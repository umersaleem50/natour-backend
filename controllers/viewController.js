const Tour = require('../models/tourModel');
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

  if (!tour) return next(new ApiError('No document tour found!', 400));
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
