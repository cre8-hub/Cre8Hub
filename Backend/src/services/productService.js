const Product = require('../models/productModel');
const Store = require('../models/storeModel');

const mapProduct = (product) => ({
  id: product._id.toString(),
  store_id: product.storeId?.toString?.() || String(product.storeId),
  owner_id: product.ownerId?.toString?.() || String(product.ownerId),
  title: product.title,
  description: product.description || '',
  price: Number(product.price),
  image_url: product.imageUrl || '',
  category: product.category || 'Other',
  product_type: product.productType || 'DIGITAL',
  file_url: product.fileUrl || '',
  file_name: product.fileName || '',
  inventory: product.inventory,
  ships_in_days: product.shipsInDays,
  sku: product.sku || '',
  is_featured: Boolean(product.isFeatured),
  is_published: Boolean(product.isPublished),
  created_at: product.createdAt,
  updated_at: product.updatedAt,
});

const validatePrice = (price) => {
  const parsed = Number(price);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw { status: 400, message: 'Price must be a non-negative number' };
  }
  return parsed;
};

const resolveOwnedStore = async (ownerId, storeId) => {
  if (storeId) {
    const store = await Store.findById(storeId).lean();
    if (!store) {
      throw { status: 404, message: 'Store not found' };
    }
    if (store.ownerId.toString() !== ownerId.toString()) {
      throw { status: 403, message: 'Unauthorized: store ownership mismatch' };
    }
    return store;
  }

  const store = await Store.findOne({ ownerId }).lean();
  if (!store) {
    throw { status: 400, message: 'Create your store before adding products' };
  }

  return store;
};

const getMyProducts = async (ownerId) => {
  const products = await Product.find({ ownerId })
    .sort({ createdAt: -1 })
    .lean();

  return products.map(mapProduct);
};

const getProductById = async (productId, requesterId = null) => {
  const product = await Product.findById(productId).lean();
  if (!product) {
    throw { status: 404, message: 'Product not found' };
  }

  const isOwner = requesterId && product.ownerId.toString() === requesterId.toString();
  if (!product.isPublished && !isOwner) {
    throw { status: 404, message: 'Product not found' };
  }

  return mapProduct(product);
};

const createProduct = async (ownerId, input) => {
  const {
    storeId,
    title,
    description,
    price,
    imageUrl,
    category,
    productType,
    fileUrl,
    fileName,
    inventory,
    shipsInDays,
    sku,
  } = input;

  const cleanedTitle = String(title || '').trim();
  if (!cleanedTitle) {
    throw { status: 400, message: 'Product title is required' };
  }

  const normalizedType = productType === 'PHYSICAL' ? 'PHYSICAL' : 'DIGITAL';
  const resolvedStore = await resolveOwnedStore(ownerId, storeId);

  const payload = {
    ownerId,
    storeId: resolvedStore._id,
    title: cleanedTitle,
    description: String(description || ''),
    price: validatePrice(price),
    imageUrl: String(imageUrl || ''),
    category: String(category || 'Other'),
    productType: normalizedType,
    fileUrl: normalizedType === 'DIGITAL' ? String(fileUrl || '') : '',
    fileName: normalizedType === 'DIGITAL' ? String(fileName || '') : '',
    inventory: normalizedType === 'PHYSICAL' && inventory !== undefined && inventory !== null
      ? Math.max(0, Number(inventory))
      : null,
    shipsInDays: normalizedType === 'PHYSICAL' && shipsInDays !== undefined && shipsInDays !== null
      ? Math.max(0, Number(shipsInDays))
      : null,
    sku: normalizedType === 'PHYSICAL' ? String(sku || '') : '',
  };

  const product = await Product.create(payload);
  return mapProduct(product.toObject());
};

const updateProduct = async (ownerId, productId, updates) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw { status: 404, message: 'Product not found' };
  }

  if (product.ownerId.toString() !== ownerId.toString()) {
    throw { status: 403, message: 'Unauthorized' };
  }

  const normalizedType = updates.productType
    ? (updates.productType === 'PHYSICAL' ? 'PHYSICAL' : 'DIGITAL')
    : product.productType;

  if (typeof updates.title === 'string' && updates.title.trim()) {
    product.title = updates.title.trim();
  }
  if (typeof updates.description === 'string') {
    product.description = updates.description;
  }
  if (updates.price !== undefined) {
    product.price = validatePrice(updates.price);
  }
  if (typeof updates.imageUrl === 'string') {
    product.imageUrl = updates.imageUrl;
  }
  if (typeof updates.category === 'string') {
    product.category = updates.category;
  }

  product.productType = normalizedType;

  if (typeof updates.fileUrl === 'string') {
    product.fileUrl = normalizedType === 'DIGITAL' ? updates.fileUrl : '';
  }
  if (typeof updates.fileName === 'string') {
    product.fileName = normalizedType === 'DIGITAL' ? updates.fileName : '';
  }

  if (normalizedType === 'PHYSICAL') {
    if (updates.inventory !== undefined) {
      product.inventory = Math.max(0, Number(updates.inventory));
    }
    if (updates.shipsInDays !== undefined) {
      product.shipsInDays = Math.max(0, Number(updates.shipsInDays));
    }
    if (typeof updates.sku === 'string') {
      product.sku = updates.sku;
    }
  } else {
    product.inventory = null;
    product.shipsInDays = null;
    product.sku = '';
  }

  await product.save();
  return mapProduct(product.toObject());
};

const publishProduct = async (ownerId, productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw { status: 404, message: 'Product not found' };
  }

  if (product.ownerId.toString() !== ownerId.toString()) {
    throw { status: 403, message: 'Unauthorized' };
  }

  product.isPublished = true;
  await product.save();

  return mapProduct(product.toObject());
};

const deleteProduct = async (ownerId, productId) => {
  const product = await Product.findById(productId).lean();
  if (!product) {
    throw { status: 404, message: 'Product not found' };
  }

  if (product.ownerId.toString() !== ownerId.toString()) {
    throw { status: 403, message: 'Unauthorized' };
  }

  await Product.deleteOne({ _id: productId });
  return { message: 'Product deleted successfully' };
};

module.exports = {
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  publishProduct,
  deleteProduct,
};
