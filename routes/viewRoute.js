const express = require('express');
const viewController = require('../controllers/viewController');

const router = express.Router();

router.get('/', viewController.getOverview);
router.get('/tour/:tourSlug', viewController.getTour);
router.get('/login', viewController.login);

module.exports = router;
