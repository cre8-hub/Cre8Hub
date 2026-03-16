const mongoose = require('mongoose');

const ORDER_STATUSES = ['PENDING', 'PAID', 'FULFILLED', 'CANCELLED'];
const ORDER_TYPES = ['DIGITAL', 'PHYSICAL'];

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    buyerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    orderType: {
      type: String,
      enum: ORDER_TYPES,
      default: 'DIGITAL',
      index: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'PENDING',
      index: true,
    },
    trackingNumber: {
      type: String,
      trim: true,
      default: '',
    },
    fulfilledAt: {
      type: Date,
      default: null,
    },
    shippingName: {
      type: String,
      trim: true,
      default: '',
    },
    shippingLine1: {
      type: String,
      trim: true,
      default: '',
    },
    shippingCity: {
      type: String,
      trim: true,
      default: '',
    },
    shippingState: {
      type: String,
      trim: true,
      default: '',
    },
    shippingZip: {
      type: String,
      trim: true,
      default: '',
    },
    shippingCountry: {
      type: String,
      trim: true,
      default: '',
    },
    platformFee: {
      type: Number,
      min: 0,
      default: 0,
    },
    sellerEarning: {
      type: Number,
      min: 0,
      default: 0,
    },
    stripePaymentIntent: {
      type: String,
      trim: true,
      default: '',
    },
    stripeSessionId: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ storeId: 1, createdAt: -1 });
orderSchema.index({ buyerId: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
