const Tour = require('../models/tourModel');

const ApiError = require('../utilities/ApiError');

const ApiFeature = require('../utilities/ApiFeature');

const catchAsync = require('../utilities/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = '5';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'sucess',
    data: {
      tours: newTour,
    },
  });
});

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

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new ApiError(`couldn't found a tour with this ID.`, 404));
  }

  res.status(200).json({
    status: 'sucess',

    data: { tour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new ApiError(`couldn't found a tour with this ID.`, 404));
  }

  res.status(200).json({ status: 'Sucess', data: { tour } });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new ApiError(`couldn't found a tour with this ID.`, 404));
  }

  res.status(204).json({ status: 'Sucess', data: null });
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
