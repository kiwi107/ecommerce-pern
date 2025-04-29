const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/auth'); // Import the verifyToken middleware
const upload = require('../middlewares/mutler'); // Import the upload middleware

router.get('/',userController.getUsers)

router.get('/info',verifyToken,userController.getUserById)

router.get('/orders',verifyToken,userController.getUserOrders)

router.put('/update',verifyToken,userController.updateUser)

router.put('/upload_photo',verifyToken,upload.single('photo'),userController.uploadPhoto)

//router.get('/favorites',verifyToken,userController.getUserFavorites)

//router.get('/reviews',verifyToken,userController.getUserReviews)

module.exports = router;

