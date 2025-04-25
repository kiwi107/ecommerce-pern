const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register',authController.register)

router.post('/login',authController.login)

router.post('/logout',authController.logout)

router.post('/forget_password',authController.forget_password)

router.post('/resetPassword/:token',authController.resetPassword)

router.get('/verify',authController.verify,(req, res) => {
  // If the token is valid, send the user data back
  res.status(200).json({ 
    user: req.user,
    message: 'Successfully authenticated'})

})

module.exports = router;

