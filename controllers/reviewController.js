const catchAsync = require('../utilities/catchAsync');
const Review = require('../models/reviewModel');

exports.getReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);
  res
    .status(200)
    .json({ status: 'success', results: reviews.length, data: { reviews } });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;

  if (!req.body.tour) req.body.tour = req.params.tourId;

  const review = await Review.create(req.body);

  res.status(201).json({ status: 'success', data: review });
});
