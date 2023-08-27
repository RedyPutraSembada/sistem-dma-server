const router = require('express').Router();
const authController = require('../app/controllers/authController');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({ usernameField: 'email' }, authController.localStrategy));
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;
