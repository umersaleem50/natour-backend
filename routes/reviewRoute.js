const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const Router = express.Router();

Router.route('/')
  .get(authController.protect, reviewController.getReviews)
  .post(reviewController.createReview);

module.exports = Router;
