const catchAsync = require('../utilities/catchAsync');
const ApiError = require('../utilities/ApiError');
const Review = require('../models/reviewModel');

exports.getReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();
  res
    .status(200)
    .json({ status: 'success', results: reviews.length, data: { reviews } });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body)
    return next(new ApiError('Please provide the details of review.', 400));
  const reqBody = {
    review: req.body.review,
    rating: req.body.rating,
    user: req.body.user,
    tour: req.body.tour,
  };

  const review = await Review.create(reqBody);
  res.status(200).json({ status: 'success', data: review });
});
