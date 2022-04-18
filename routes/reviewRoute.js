const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const Router = express.Router({ mergeParams: true });

Router.use(authController.protect);

Router.route('/')
  .get(authController.protect, reviewController.getReviews)
  .post(
    authController.restrict('user'),
    reviewController.addTourUserId,
    reviewController.createReview
  );

Router.route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrict('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrict('user', 'admin'),
    reviewController.updateReview
  );

module.exports = Router;
