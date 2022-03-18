const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');

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

module.exports = app;
