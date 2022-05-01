const express = require('express');
const path = require('path');
const cors = require('cors');
// const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const ApiError = require('./utilities/ApiError');

const globalErrorHandler = require('./controllers/globalErrorHandler');

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute');
const viewRouter = require('./routes/viewRoute');

const app = express();

dotenv.config({ path: `${__dirname}/config.env` });

//MIDDLEWARES
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(cors());

// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//     crossOriginEmbedderPolicy: false,
//     crossOriginOpenerPolicy: false,
//     crossOriginResourcePolicy: false,
//     dnsPrefetchControl: false,
//     expectCt: false,
//     frameguard: false,
//     hidePoweredBy: false,
//     hsts: false,
//     ieNoOpen: false,
//     noSniff: false,
//     originAgentCluster: false,
//     permittedCrossDomainPolicies: false,
//     referrerPolicy: false,
//     xssFilter: false,
//   })
// );

//FOR GET REQUEST DETAILS IN DEVELOPMENT
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

//FOR BODY PARSING, AND WILL LIMIT THE AMMOUNT OF DATA COMMING
app.use(express.json({ limit: '10kb' }));

//SANITIZE THE DATA
app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [`ratingsAverage`, `ratingsQuantity`, `duration`, `price`],
  })
);

//FOR SERVING STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

const requestLimit = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests from same IP, Please try again in 1 hour',
});

//FOR LIMITING THE AMMOUNT OF REQUESTS

app.use('/api', requestLimit);

///////////////////
//ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(
    new ApiError(`we couldn't found ${req.originalUrl} on this server!`, 404)
  );
});

app.use(globalErrorHandler);

module.exports = app;
