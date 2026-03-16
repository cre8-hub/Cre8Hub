const express = require('express');
const productController = require('../controllers/productController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { uploadImage, uploadFile } = require('../middleware/upload');

const router = express.Router();

router.post('/upload-image', authenticateToken, uploadImage, productController.uploadImageHandler);
router.post('/upload-file', authenticateToken, uploadFile, productController.uploadFileHandler);
router.get('/mine', authenticateToken, productController.getMyProducts);
router.get('/:productId', optionalAuth, productController.getProductById);
router.post('/', authenticateToken, productController.createProduct);
router.patch('/orders/:orderId/tracking', authenticateToken, productController.updateTracking);
router.put('/:productId', authenticateToken, productController.updateProduct);
router.patch('/:productId/publish', authenticateToken, productController.publishProduct);
router.delete('/:productId', authenticateToken, productController.deleteProduct);

module.exports = router;
