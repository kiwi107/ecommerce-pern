const express = require('express');
const { getTags, getProductsForTag, getProductDetails, getAllProducts,addReview } = require('../controllers/productController.js');

const { verifyToken } = require('../middlewares/auth.js');
const router = express.Router();
router.get('/tags', getTags);
router.get('/products-for-tag/:tag_id', getProductsForTag);
router.get('/product/:product_id', getProductDetails);
router.get('/', getAllProducts);
router.post('/:productId/review',verifyToken, addReview); 

module.exports = router;


