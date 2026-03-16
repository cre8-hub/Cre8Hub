const mongoose = require('mongoose');

const PRODUCT_TYPES = ['DIGITAL', 'PHYSICAL'];

const productSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 160,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 4000,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: 'Other',
    },
    productType: {
      type: String,
      enum: PRODUCT_TYPES,
      default: 'DIGITAL',
    },
    fileUrl: {
      type: String,
      trim: true,
      default: '',
    },
    fileName: {
      type: String,
      trim: true,
      default: '',
    },
    inventory: {
      type: Number,
      min: 0,
      default: null,
    },
    shipsInDays: {
      type: Number,
      min: 0,
      default: null,
    },
    sku: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ storeId: 1, isPublished: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
