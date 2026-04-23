const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middlewares/mutler'); // Import the upload middleware



router.get('/campaign', adminController.getAllCampaigns);
router.post('/campaign', adminController.createCampaign);
router.delete('/campaign/:id', adminController.deleteCampaign);
router.get('/campaign/:id/impact', adminController.getCampaignImpact);
router.get('/campaign/:campaignId/discounts', adminController.getDiscountsByCampaign);
router.post('/campaign/:campaignId/discounts', adminController.createDiscount);
router.put('/campaign/discounts/:discountId', adminController.updateDiscount);
router.delete('/campaign/discounts/:discountId', adminController.deleteDiscount);


router.get('/products', adminController.getAllProducts);
router.post('/products', upload.array('images'), adminController.createProduct);
router.get('/products/:id/base', adminController.getProductBase);
router.get('/products/:id/details', adminController.getProductDetails);
router.get('/products/:id/variants', adminController.getProductVariants);
router.put('/products/:id', upload.array('images'), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.get('/top-products', adminController.getTopProducts);
router.get('/campaign/:campaignId/report', adminController.getCampaignReport);
router.get('/orders', adminController.getAllOrders);
router.get('/orders/:orderId', adminController.getOrderDetails);
router.put('/orders/:orderId/status', adminController.updateOrderStatus);

router.get('/refunds', adminController.getAllRefunds);
router.patch('/refunds/:refundId/status', adminController.updateRefundStatus);
router.get('/inventory', adminController.getInventory);
router.put('/product-variant/:variantId', adminController.updateInventory);

router.get('/tags', adminController.getTags);
router.post('/tag', adminController.createTag);
router.delete('/tag/:tagId', adminController.deleteTag);
router.get('/tag/:tagId/products', adminController.getProductsForTag);
router.post('/tag/:tagId/product', adminController.insertProductToTag);
router.delete('/tag/:tagId/product/:productId', adminController.removeProductFromTag);



module.exports = router;
