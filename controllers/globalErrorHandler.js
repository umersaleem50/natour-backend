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

const handleJWTInvalidToken = () => {
  const newError = new ApiError('Invalid Token! Please login again.', 401);
  return newError;
};

const handleJWTExpireToken = () =>
  new ApiError('Token is expired!, Please login again!', 401);

// SHOW ERRORS IN DEVELOPMENT
const showErrDev = (err, req, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  //IF AN API CALL

  if (req.originalUrl.startsWith('/api')) {
    return res.status(statusCode).json({
      // status: 'failed',
      status: status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  //IF THE PAGE IS GOING TO RENDER
  res.status(statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

// SHOW ERRORS IN PRODUCTION
const showErrProd = (err, req, res) => {
  //IF THIS IS AN API CALL
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    return res.status(500).json({
      status: err.status,
      message: 'something went wrong!',
    });
  }

  //  IF PAGE IS GOING TO RENDER
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Somthing went wrong',
      msg: err.message,
    });
  }
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later!',
  });
};

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    showErrDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDublicateErrorDB(error);
    if (error._message === 'Validation failed')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTInvalidToken();
    if (error.name === 'TokenExpiredError') error = handleJWTExpireToken();

    showErrProd(error, req, res);
  }
  next();
};
