const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth'); // Import the verifyToken middleware
const { verify } = require('crypto');

router.post('/register',authController.register)

router.post('/login',authController.login)

router.post('/logout',authController.logout)

router.post('/forget_password',authController.forget_password)

router.post('/resetPassword/:token',authController.resetPassword)

router.get('/check',verifyToken, (req, res) => {
  res.status(200).json({ message: 'You are authenticated', authenticated: true });
})



module.exports = router;

