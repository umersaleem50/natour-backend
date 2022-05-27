const express = require('express');

const authController = require('../controllers/authController');
const tourController = require('../controllers/tourController');
const reviewRouter = require('./reviewRoute');

const tourRouter = express.Router();

tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter
  .route('/top-5-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter
  .route('/monthly-plans/:year')
  .get(
    authController.protect,
    authController.restrict('admin', 'lead-guide', 'guide'),
    tourController.getTourPlans
  );

tourRouter
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

tourRouter
  .route('/tour-distances/:latlng/unit/:unit')
  .get(tourController.getTourDistances);

tourRouter
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect, tourController.createTour);

tourRouter.use(authController.protect);

tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrict('admin'),
    tourController.uploadTourImages,
    tourController.resizeImages,
    tourController.updateTour
  )
  .delete(
    authController.restrict('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = tourRouter;
