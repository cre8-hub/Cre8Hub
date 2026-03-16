const express = require('express');
const storeController = require('../controllers/storeController');
const { authenticateToken } = require('../middleware/auth');
const { uploadBanner } = require('../middleware/upload');

const router = express.Router();

router.post('/upload-banner', authenticateToken, uploadBanner, storeController.uploadBannerHandler);
router.get('/mine', authenticateToken, storeController.getMyStore);
router.post('/', authenticateToken, storeController.createStore);
router.patch('/mine', authenticateToken, storeController.updateMyStore);
router.post('/:storeId/publish', authenticateToken, storeController.publishStore);
router.get('/public/:slug', storeController.getPublicStore);

module.exports = router;
