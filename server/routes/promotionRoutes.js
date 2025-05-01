const {getCoupon}= require('../controllers/promotionController')
const express = require('express');
const router = express.Router();


// Route to get all promotions
router.post('/coupan', getCoupon);

module.exports = router;