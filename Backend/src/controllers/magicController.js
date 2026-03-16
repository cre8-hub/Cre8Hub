const MagicLink = require('../models/magicLinkModel');
const Order = require('../models/orderModel');

const verifyMagicLink = async (req, res) => {
  const { token } = req.params;

  const magicLink = await MagicLink.findOne({ token }).lean();
  if (!magicLink) {
    return res.status(400).json({ message: 'Invalid or expired link' });
  }

  if (magicLink.expiresAt && magicLink.expiresAt.getTime() <= Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired link' });
  }

  const order = await Order.findById(magicLink.orderId).populate('productId').lean();
  if (!order) {
    return res.status(400).json({ message: 'Invalid or expired link' });
  }

  return res.json({
    product_id: order.productId?._id?.toString() || null,
    user_email: order.buyerEmail,
    total_amount: Number(order.totalAmount),
    product_title: order.productId?.title || null,
    product_description: order.productId?.description || null,
  });
};

module.exports = {
  verifyMagicLink,
};
