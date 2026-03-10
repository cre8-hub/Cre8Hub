const Store = require('../models/storeModel');
const Product = require('../models/productModel');

const mapStore = (store) => ({
  id: store._id.toString(),
  owner_id: store.ownerId?.toString?.() || String(store.ownerId),
  store_name: store.storeName,
  store_slug: store.storeSlug,
  description: store.description || '',
  banner_url: store.bannerUrl || '',
  logo_url: store.logoUrl || '',
  bio: store.bio || '',
  twitter: store.socialLinks?.twitter || '',
  instagram: store.socialLinks?.instagram || '',
  youtube: store.socialLinks?.youtube || '',
  is_published: Boolean(store.isPublished),
  created_at: store.createdAt,
  updated_at: store.updatedAt,
});

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

const slugify = (value) => {
  const slug = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'store';
};

const buildUniqueSlug = async (storeName, excludeStoreId = null) => {
  const baseSlug = slugify(storeName);
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const query = { storeSlug: candidate };
    if (excludeStoreId) {
      query._id = { $ne: excludeStoreId };
    }

    // eslint-disable-next-line no-await-in-loop
    const existing = await Store.findOne(query).select('_id').lean();
    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

const createStore = async (ownerId, storeName) => {
  const cleanedStoreName = String(storeName || '').trim();

  if (!cleanedStoreName || cleanedStoreName.length < 3) {
    throw { status: 400, message: 'Store name must be at least 3 characters long' };
  }

  const existingStore = await Store.findOne({ ownerId }).select('_id').lean();
  if (existingStore) {
    throw { status: 400, message: 'You already have a store' };
  }

  const storeSlug = await buildUniqueSlug(cleanedStoreName);

  const store = await Store.create({
    ownerId,
    storeName: cleanedStoreName,
    storeSlug,
  });

  return mapStore(store.toObject());
};

const getMyStore = async (ownerId) => {
  const store = await Store.findOne({ ownerId }).lean();
  if (!store) {
    throw { status: 404, message: 'Store not found' };
  }

  return mapStore(store);
};

const updateMyStore = async (ownerId, updates) => {
  const store = await Store.findOne({ ownerId });
  if (!store) {
    throw { status: 404, message: 'Store not found' };
  }

  const {
    storeName,
    description,
    bannerUrl,
    logoUrl,
    bio,
    socialLinks,
  } = updates;

  if (typeof storeName === 'string' && storeName.trim()) {
    store.storeName = storeName.trim();
  }

  if (typeof description === 'string') {
    store.description = description;
  }

  if (typeof bannerUrl === 'string') {
    store.bannerUrl = bannerUrl;
  }

  if (typeof logoUrl === 'string') {
    store.logoUrl = logoUrl;
  }

  if (typeof bio === 'string') {
    store.bio = bio;
  }

  if (socialLinks && typeof socialLinks === 'object') {
    store.socialLinks = {
      ...store.socialLinks,
      ...socialLinks,
    };
  }

  await store.save();

  return mapStore(store.toObject());
};

const publishStore = async (storeId, ownerId) => {
  const store = await Store.findById(storeId);
  if (!store) {
    throw { status: 404, message: 'Store not found' };
  }

  if (store.ownerId.toString() !== ownerId.toString()) {
    throw { status: 403, message: 'Unauthorized' };
  }

  store.isPublished = true;
  await store.save();

  return mapStore(store.toObject());
};

const getPublicStoreBySlug = async (slug) => {
  const store = await Store.findOne({ storeSlug: slug, isPublished: true }).lean();
  if (!store) {
    throw { status: 404, message: 'Store not found' };
  }

  const products = await Product.find({
    storeId: store._id,
    isPublished: true,
  })
    .sort({ createdAt: -1 })
    .lean();

  return {
    ...mapStore(store),
    products: products.map(mapProduct),
  };
};

module.exports = {
  createStore,
  getMyStore,
  updateMyStore,
  publishStore,
  getPublicStoreBySlug,
};
