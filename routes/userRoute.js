const router = require('express').Router();
const userController = require('../app/controllers/userController');
const { police_check } = require('../app/middleware/checkAuth');

router.post('/user', userController.createUser);
router.get('/users', police_check('index', 'User'), userController.index);
router.put('/user/:id', police_check('update', 'User'), userController.updateUser);

module.exports = router;