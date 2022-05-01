const express = require('express');

const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/', viewController.getOverview);
router.get('/tour/:tourSlug', viewController.getTour);
router.get('/login', viewController.login);

module.exports = router;

///implementing login, not working
