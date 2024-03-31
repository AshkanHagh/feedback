const router = require('express').Router();

const isAuth = require('../middlewares/verify-token');

const adminController = require('../controllers/admin');


router.get('/users', isAuth, adminController.getAllSignedUsers);

router.get('/feedback', isAuth, adminController.getAllFeedbacks);


module.exports = router;