const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/auth'); // Import the verifyToken middleware
const upload = require('../middlewares/mutler'); // Import the upload middleware

router.get('/',userController.getUsers)
router.post('/address',verifyToken,userController.insertAddress)
router.get('/address',verifyToken,userController.getAddresses)

router.get('/info',verifyToken,userController.getUserById)

router.get('/orders',verifyToken,userController.getUserOrders)

router.put('/update',verifyToken,userController.updateUser)

router.put('/upload_photo',verifyToken,upload.single('photo'),userController.uploadPhoto)

router.get('/refunds',verifyToken,userController.getUserRefunds)

//router.get('/favorites',verifyToken,userController.getUserFavorites)

router.get('/reviews',verifyToken,userController.getUserReviews)

router.delete('/reviews/:id',verifyToken,userController.deleteUserReview)

module.exports = router;

