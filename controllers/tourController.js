const Tour = require('../models/tourModel');
const ApiFeature = require('../utilities/ApiFeature');
// exports.checkID = (req, res, next, val) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({ status: 'fail', message: 'Not Found!' });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = '5';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

const higherAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => next(err));
};

exports.createTour = higherAsync(async (req, res) => {
  // try {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'sucess',
    data: {
      tours: newTour,
    },
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: 'Invalid body passed',
  //     dbMessage: err.message,
  //   });
  // }
});

exports.getAllTours = higherAsync(async (req, res, next) => {
  console.log(req.query);

  // try {
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
  // } catch (err) {
  //   res.status(404).json({ status: 'fail', message: err });
  // }
});

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'sucess',

      data: { tour },
    });
  } catch (err) {
    res
      .status(404)
      .json({ status: 'fail', message: 'Failed to get tours', dbError: err });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: 'Sucess', data: { tour } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'Sucess', data: null });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.getTourPlans = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};
