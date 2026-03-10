const orderService = require('../services/orderService');

const sendError = (res, error, fallbackMessage = 'Order request failed') => {
  const status = error.status || 500;
  return res.status(status).json({ message: error.message || fallbackMessage });
};

const createOrder = async (req, res) => {
  try {
    const buyerId = req.user?.userId || null;
    const buyerEmail = req.body.buyerEmail || req.user?.email;

    const order = await orderService.createOrder({
      buyerId,
      buyerEmail,
      productId: req.body.productId,
    });

    return res.status(201).json(order);
  } catch (error) {
    return sendError(res, error, 'Failed to place order');
  }
};

const getMySales = async (req, res) => {
  try {
    const orders = await orderService.getMySales(req.user.userId);

    return res.json(orders);
  } catch (error) {
    return sendError(res, error, 'Failed to fetch sales');
  }
};

const getMyPurchases = async (req, res) => {
  try {
    const orders = await orderService.getMyPurchases(req.user.userId);

    return res.json(orders);
  } catch (error) {
    return sendError(res, error, 'Failed to fetch purchases');
  }
};

const updateTracking = async (req, res) => {
  try {
    const trackingNumber = req.body.trackingNumber;
    if (!trackingNumber) {
      return res.status(400).json({ message: 'Tracking number is required' });
    }

    const order = await orderService.updateTracking(
      req.user.userId,
      req.params.orderId,
      trackingNumber
    );

    return res.json(order);
  } catch (error) {
    return sendError(res, error, 'Failed to update tracking');
  }
};

module.exports = {
  createOrder,
  getMySales,
  getMyPurchases,
  updateTracking,
};
