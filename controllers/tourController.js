const Tour = require('../models/tourModel');
// const ApiError = require('../utilities/ApiError');
const ApiFeature = require('../utilities/ApiFeature');
const catchAsync = require('../utilities/catchAsync');
const factory = require('./handleFactory');

exports.aliasTopTours = (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = '5';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

exports.createTour = factory.createOne(Tour);

exports.getAllTours = catchAsync(async (req, res) => {
  const feature = new ApiFeature(Tour, req.query)
    .filter()
    .sort()
    .limit()
    .paginate();

  const tours = await feature.query;

  res.status(200).json({
    status: 'sucess',
    result: tours.length,
    data: { tours },
  });
});

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },

    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTour: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsQuantity' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
    {
      $match: { _id: { $ne: 'EASY' } },
    },
  ]);

  res.status(200).json({
    message: 'sucess',
    data: {
      tours: stats,
    },
  });
});

//THIS NEED TO BE FIXED, OTHERWISE REQUEST NOT WORKING
/////////////////////
exports.getTourPlans = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plans = await Tour.aggregate([
    { $unwind: `$startDates` },
    {
      $match: {
        startDates: {
          $gte: `${year}-01-01`,
          $lte: `${year}-12-31`,
        },
      },
    },
    {
      $group: {
        _id: `$startDates`,
        month: { $month: { $dateFromString: '$startDate' } },
      },
    },
  ]);

  res.status(200).json({
    message: 'sucess',
    data: {
      tours: plans,
    },
  });
});

exports.getTour = factory.getOne(Tour, { path: 'review' });
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
