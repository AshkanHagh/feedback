const router = require('express').Router();
const { body } = require('express-validator');

const authControl = require('../controllers/auth');


router.post('/signup', [body('username').trim().isLowercase().notEmpty(), body('email').trim().isEmail().notEmpty(), 
body('password').trim().isLength({min : 8}).notEmpty()], authControl.signup);

router.post('/login', [body('email').trim().isEmail().notEmpty(), body('password').trim().isLength({min : 8}).notEmpty()], authControl.login);


module.exports = router;