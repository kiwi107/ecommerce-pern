const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/create', orderController.createOrder);
router.get('/getOrders', orderController.getOrders);
router.get('/:order_id', orderController.getOrderDetails);

module.exports = router;

