const catchAsync = require('../utilities/catchAsync');
const ApiError = require('../utilities/ApiError');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new ApiError(`No Document found with this ID.`, 404));
    }

    res.status(204).json({ status: 'Sucess', data: null });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'sucess',
      data: {
        data: doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new ApiError(`No document found with this ID.`, 404));
    }

    res.status(200).json({ status: 'Sucess', data: { data: doc } });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id);
    if (populateOptions) query.populate(populateOptions);

    const doc = await query;
    if (!doc) {
      return next(new ApiError(`couldn't found a document with this ID.`, 404));
    }

    res.status(200).json({
      status: 'sucess',

      data: { doc },
    });
  });
