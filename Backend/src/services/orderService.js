const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Store = require('../models/storeModel');
const Payout = require('../models/payoutModel');

const mapOrder = (order) => ({
  id: order._id.toString(),
  buyer_id: order.buyerId ? order.buyerId.toString() : null,
  user_email: order.buyerEmail,
  store_id: order.storeId?._id
    ? order.storeId._id.toString()
    : order.storeId?.toString?.() || String(order.storeId),
  product_id: order.productId?._id
    ? order.productId._id.toString()
    : order.productId?.toString?.() || String(order.productId),
  total_amount: Number(order.totalAmount),
  order_type: order.orderType || 'DIGITAL',
  status: order.status,
  tracking_number: order.trackingNumber || '',
  fulfilled_at: order.fulfilledAt || null,
  shipping_name: order.shippingName || '',
  shipping_line1: order.shippingLine1 || '',
  shipping_city: order.shippingCity || '',
  shipping_state: order.shippingState || '',
  shipping_zip: order.shippingZip || '',
  shipping_country: order.shippingCountry || '',
  platform_fee: Number(order.platformFee || 0),
  seller_earning: Number(order.sellerEarning || 0),
  created_at: order.createdAt,
  updated_at: order.updatedAt,
  product: order.productId && order.productId.title
    ? {
      id: order.productId._id.toString(),
      title: order.productId.title,
      price: Number(order.productId.price),
      product_type: order.productId.productType,
    }
    : null,
});

const createOrder = async ({ buyerId = null, buyerEmail, productId }) => {
  if (!productId) {
    throw { status: 400, message: 'Product ID is required' };
  }

  const cleanedEmail = String(buyerEmail || '').trim().toLowerCase();
  if (!cleanedEmail) {
    throw { status: 400, message: 'Buyer email is required' };
  }

  const product = await Product.findById(productId);
  if (!product || !product.isPublished) {
    throw { status: 404, message: 'Product not found' };
  }

  const store = await Store.findById(product.storeId).lean();
  if (!store || !store.isPublished) {
    throw { status: 404, message: 'Store not available' };
  }

  if (product.productType === 'PHYSICAL' && product.inventory !== null && product.inventory <= 0) {
    throw { status: 400, message: 'Product is out of stock' };
  }

  const order = await Order.create({
    buyerId,
    buyerEmail: cleanedEmail,
    storeId: product.storeId,
    productId: product._id,
    totalAmount: product.price,
    orderType: product.productType || 'DIGITAL',
    status: 'PENDING',
  });

  if (product.productType === 'PHYSICAL' && product.inventory !== null) {
    product.inventory = Math.max(0, product.inventory - 1);
    await product.save();
  }

  const populatedOrder = await Order.findById(order._id)
    .populate('productId', 'title price productType')
    .lean();

  return mapOrder(populatedOrder);
};

const markOrderPaidService = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw { status: 404, message: 'Order not found' };
  }

  if (order.status === 'PAID') {
    return mapOrder(order.toObject());
  }

  const totalAmount = Number(order.totalAmount);
  if (Number.isNaN(totalAmount)) {
    throw { status: 500, message: 'Invalid order amount' };
  }

  const platformFee = Number((totalAmount * 0.05).toFixed(2));
  const sellerEarning = Number((totalAmount - platformFee).toFixed(2));

  order.status = 'PAID';
  order.platformFee = platformFee;
  order.sellerEarning = sellerEarning;
  await order.save();

  const store = await Store.findById(order.storeId).select('ownerId').lean();
  if (store?.ownerId) {
    await Payout.findOneAndUpdate(
      { orderId: order._id },
      {
        sellerId: store.ownerId,
        orderId: order._id,
        amount: sellerEarning,
        status: 'PENDING',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const populated = await Order.findById(order._id)
    .populate('productId', 'title price productType')
    .lean();

  return mapOrder(populated);
};

const getMySales = async (ownerId) => {
  const stores = await Store.find({ ownerId }).select('_id').lean();
  const storeIds = stores.map((store) => store._id);

  if (storeIds.length === 0) {
    return [];
  }

  const orders = await Order.find({ storeId: { $in: storeIds } })
    .sort({ createdAt: -1 })
    .populate('productId', 'title price productType')
    .lean();

  return orders.map(mapOrder);
};

const getMyPurchases = async (buyerId) => {
  const orders = await Order.find({ buyerId })
    .sort({ createdAt: -1 })
    .populate('productId', 'title price productType')
    .lean();

  return orders.map(mapOrder);
};

const updateTracking = async (ownerId, orderId, trackingNumber) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw { status: 404, message: 'Order not found' };
  }

  const store = await Store.findById(order.storeId).lean();
  if (!store || store.ownerId.toString() !== ownerId.toString()) {
    throw { status: 403, message: 'Unauthorized' };
  }

  order.trackingNumber = String(trackingNumber || '').trim();
  order.status = 'FULFILLED';
  order.fulfilledAt = new Date();
  await order.save();

  const populatedOrder = await Order.findById(order._id)
    .populate('productId', 'title price productType')
    .lean();

  return mapOrder(populatedOrder);
};

module.exports = {
  createOrder,
  markOrderPaidService,
  getMySales,
  getMyPurchases,
  updateTracking,
};
