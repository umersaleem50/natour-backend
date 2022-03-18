const express = require('express');

const tourController = require('../controllers/tourController');

const tourRouter = express.Router();

tourRouter
  .route('/top-5-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter.route('/monthly-plans/:year').get(tourController.getTourPlans);

tourRouter
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = tourRouter;
