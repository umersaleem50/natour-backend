const ApiError = require('../utilities/ApiError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.kind}: ${err.value}.`;
  return new ApiError(message, 400);
};

const handleDublicateErrorDB = (err) => {
  const { name: value } = err.keyValue;
  const message = `Dublicate field value: /${value}/, Please use another value!`;
  return new ApiError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.properties.message);
  const message = `Invalid values passed! ${errors.join('. ')}`;
  return new ApiError(message, 400);
};

const showErrDev = (err, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  res.status(statusCode).json({
    // status: 'failed',
    status: status,
    // // error: err,
    message: err.message,
    stack: err.stack,
  });
};

const showErrProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: err.status,
      message: 'something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    showErrDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDublicateErrorDB(error);
    if (error._message === 'Validation failed')
      error = handleValidationErrorDB(error);
    showErrProd(error, res);
  }
  next();
};
