const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/',userController.getUsers)
router.post('/address',userController.insertAddress)
router.get('/address',userController.getAddresses)




module.exports = router;

