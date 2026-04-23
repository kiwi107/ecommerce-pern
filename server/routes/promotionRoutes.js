const {getCoupon,getAllCoupons,insertCoupon,deleteCoupon,getCouponUsage,editCoupon}= require('../controllers/promotionController')
const express = require('express');
const router = express.Router();


router.get('/coupons',getAllCoupons)
router.post('/coupan', getCoupon);
router.post('/coupons', insertCoupon);
router.delete('/coupons/:couponId', deleteCoupon);
router.get('/coupon/:couponId/usage', getCouponUsage);
router.put('/coupons/:couponId', editCoupon)


module.exports = router;