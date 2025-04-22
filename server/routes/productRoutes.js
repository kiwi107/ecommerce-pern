const express = require('express');
const { getTags,getProductsForTag } = require('../controllers/productController.js');

const router = express.Router();
router.get('/tags', getTags);
router.get('/products-for-tag/:tag_id', getProductsForTag);


module.exports = router;


