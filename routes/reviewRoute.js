const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const Router = express.Router({ mergeParams: true });

Router.route('/')
  .get(authController.protect, reviewController.getReviews)
  .post(
    authController.protect,
    authController.restrict('user'),
    reviewController.addTourUserId,
    reviewController.createReview
  );

Router.route('/:id')
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);

module.exports = Router;
