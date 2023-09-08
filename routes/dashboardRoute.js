const router = require('express').Router();
const dashboardController = require('../app/controllers/dashboardController');

router.get('/dash', dashboardController.index);

module.exports = router;