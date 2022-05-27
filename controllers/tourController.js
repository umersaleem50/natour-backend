const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');

const catchAsync = require('../utilities/catchAsync');
const factory = require('./handleFactory');
const ApiError = require('../utilities/ApiError');

const storage = multer.memoryStorage();

const filter = (req, file, cp) => {
  if (file.mimetype.startsWith('image')) {
    return cp(null, true);
  }
  return cp(new ApiError('Wrong file type, Please use an image!', 401), false);
};

const upload = multer({ storage, fileFilter: filter });

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = '5';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

exports.createTour = factory.createOne(Tour);

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

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const radius = unit === 'mi' ? distance / 3963 : distance / 6371;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng)
    return next(
      new ApiError('Please provide the coordinates of your location', 400)
    );

  const tour = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  res
    .status(200)
    .json({ status: 'success', results: tour.length, data: { data: tour } });
});

exports.getTourDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  if (!lng || !lat)
    return next(
      new ApiError('Please provide the langitude and latitudes', 400)
    );

  const multipler = unit === 'mi' ? 0.00062 : 0.0001;

  console.log(lng, lat, multipler);

  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multipler,
      },
    },
  ]);

  res.status(200).json({ status: 'sucess', data: { distance } });
});

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'review' });
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
