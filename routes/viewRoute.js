const express = require('express');

const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get(
  '/tour/:tourSlug',
  authController.isLoggedIn,
  viewController.getTour
);
router.get('/login', viewController.login);
router.get('/me', authController.protect, viewController.userAccount);

module.exports = router;

///implementing login, not working
