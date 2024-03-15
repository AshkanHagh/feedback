const router = require('express').Router();
const isAuth = require('../middlewares/verify-token');

const adminControl = require('../controllers/admin');


router.get('/', adminControl.getMessages);

router.get('/:id', adminControl.getSingleMessage);

router.delete('/:id', /*isAuth*/ adminControl.deleteMessage);


module.exports = router;