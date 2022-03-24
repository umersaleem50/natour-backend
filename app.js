const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const ApiError = require('./utilities/ApiError');
const globalErrorHandler = require('./controllers/globalErrorHandler');
dotenv.config({ path: `${__dirname}/config.env` });

const app = express();

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');

//MIDDLEWARES

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

///////////////////
//ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'failed',
  //   message: `we couldn't found ${req.originalUrl} on this server!`,
  // });

  next(
    new ApiError(`we couldn't found ${req.originalUrl} on this server!`, 404)
  );
});

app.use(globalErrorHandler);

module.exports = app;
