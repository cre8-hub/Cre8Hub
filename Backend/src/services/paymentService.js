const Stripe = require('stripe');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Store = require('../models/storeModel');
const MagicLink = require('../models/magicLinkModel');

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-01-28.clover' })
  : null;

const ensureStripe = () => {
  if (!stripe) {
    throw { status: 500, message: 'Stripe is not configured on this server' };
  }
};

const createCheckoutSession = async (productId, email) => {
  ensureStripe();

  const product = await Product.findById(productId).lean();
  if (!product || !product.isPublished) {
    throw { status: 404, message: 'Product not found or not published' };
  }

  const store = await Store.findById(product.storeId).lean();
  if (!store || !store.isPublished) {
    throw { status: 404, message: 'Store not found or not published' };
  }

  const isPhysical = product.productType === 'PHYSICAL';

  if (isPhysical && product.inventory !== null) {
    if (product.inventory <= 0) {
      throw { status: 400, message: 'This product is out of stock.' };
    }

    const reserved = await Product.findOneAndUpdate(
      { _id: productId, inventory: { $gt: 0 } },
      { $inc: { inventory: -1 } },
      { new: true }
    ).lean();

    if (!reserved) {
      throw { status: 400, message: 'This product just sold out. Please try again later.' };
    }
  }

  const order = await Order.create({
    buyerEmail: String(email).toLowerCase(),
    productId: product._id,
    storeId: product.storeId,
    totalAmount: Number(product.price),
    status: 'PENDING',
    orderType: product.productType || 'DIGITAL',
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

  const stripeImages = product.imageUrl && /^https?:\/\//i.test(product.imageUrl)
    ? [product.imageUrl]
    : undefined;

  const sessionParams = {
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.title,
            ...(product.description ? { description: product.description } : {}),
            ...(stripeImages ? { images: stripeImages } : {}),
          },
          unit_amount: Math.round(Number(product.price) * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      orderId: order._id.toString(),
      productId: product._id.toString(),
      orderType: product.productType || 'DIGITAL',
    },
    success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/cancel`,
  };

  if (isPhysical) {
    sessionParams.shipping_address_collection = {
      allowed_countries: ['US', 'CA', 'GB', 'AU', 'IN', 'SG', 'DE', 'FR', 'NL'],
    };
    sessionParams.shipping_options = [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 0, currency: 'usd' },
          display_name: `Standard Shipping (ships in ${product.shipsInDays ?? 3} days)`,
          delivery_estimate: {
            minimum: { unit: 'business_day', value: product.shipsInDays ?? 3 },
            maximum: { unit: 'business_day', value: (product.shipsInDays ?? 3) + 5 },
          },
        },
      },
    ];
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  if (!session.url) {
    throw { status: 500, message: 'Stripe did not return a checkout URL.' };
  }

  order.stripeSessionId = session.id;
  await order.save();

  return { url: session.url, orderId: order._id.toString() };
};

const getSessionDetails = async (sessionId) => {
  ensureStripe();

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    throw { status: 404, message: 'No order found for this session' };
  }

  const order = await Order.findById(orderId)
    .populate('productId')
    .populate('storeId')
    .lean();

  if (!order) {
    throw { status: 404, message: 'Order not found' };
  }

  const magic = await MagicLink.findOne({ orderId: order._id }).lean();

  return {
    id: order._id.toString(),
    user_email: order.buyerEmail,
    status: order.status,
    total_amount: Number(order.totalAmount),
    order_type: order.orderType || 'DIGITAL',
    shipping_name: order.shippingName || null,
    shipping_line1: order.shippingLine1 || null,
    shipping_city: order.shippingCity || null,
    shipping_state: order.shippingState || null,
    shipping_zip: order.shippingZip || null,
    shipping_country: order.shippingCountry || null,
    tracking_number: order.trackingNumber || null,
    product_title: order.productId?.title || null,
    product_description: order.productId?.description || null,
    ships_in_days: order.productId?.shipsInDays ?? null,
    magic_token: magic?.token || null,
    store_slug: order.storeId?.storeSlug || null,
  };
};

module.exports = {
  stripe,
  createCheckoutSession,
  getSessionDetails,
};
