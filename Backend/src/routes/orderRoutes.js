const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', optionalAuth, orderController.createOrder);
router.get('/my-sales', authenticateToken, orderController.getMySales);
router.get('/my-purchases', authenticateToken, orderController.getMyPurchases);
router.patch('/:orderId/tracking', authenticateToken, orderController.updateTracking);

module.exports = router;
