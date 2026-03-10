const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/checkout', paymentController.createCheckout);
router.get('/session/:sessionId', paymentController.getSessionDetailsHandler);

module.exports = router;
