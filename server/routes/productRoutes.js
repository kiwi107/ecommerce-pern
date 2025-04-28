const express = require('express');
const { getTags,getProductsForTag ,getProductDetails} = require('../controllers/productController.js');

const router = express.Router();
router.get('/tags', getTags);
router.get('/products-for-tag/:tag_id', getProductsForTag);
router.get('/product/:product_id', getProductDetails);


module.exports = router;


