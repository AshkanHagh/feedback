const router = require('express').Router();
const { body } = require('express-validator');

const isAuth = require('../middlewares/verify-token');

const commentController = require('../controllers/feedback');


router.post('/feedback', body('comment').trim().isLength({min : 6, max : 255}).notEmpty(), isAuth, commentController.addComment);


module.exports = router;