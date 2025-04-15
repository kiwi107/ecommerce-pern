const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register',authController.register)

router.post('/login',authController.login)

router.post('/logout',authController.logout)

router.post('/forget_password',authController.forget_password)



module.exports = router;

