const storeService = require('../services/storeService');
const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;

const sendError = (res, error, fallbackMessage = 'Store request failed') => {
  const status = error.status || 500;
  return res.status(status).json({ message: error.message || fallbackMessage });
};

const createStore = async (req, res) => {
  try {
    const { storeName } = req.body;
    const store = await storeService.createStore(req.user.userId, storeName);
    return res.status(201).json(store);
  } catch (error) {
    return sendError(res, error, 'Failed to create store');
  }
};

const getMyStore = async (req, res) => {
  try {
    const store = await storeService.getMyStore(req.user.userId);
    return res.json(store);
  } catch (error) {
    return sendError(res, error, 'Failed to fetch store');
  }
};

const updateMyStore = async (req, res) => {
  try {
    const payload = {
      storeName: req.body.storeName ?? req.body.store_name,
      description: req.body.description,
      bannerUrl: req.body.bannerUrl ?? req.body.banner_url,
      logoUrl: req.body.logoUrl ?? req.body.logo_url,
      bio: req.body.bio,
      socialLinks: req.body.socialLinks,
    };

    const store = await storeService.updateMyStore(req.user.userId, payload);

    return res.json(store);
  } catch (error) {
    return sendError(res, error, 'Failed to update store');
  }
};

const publishStore = async (req, res) => {
  try {
    const store = await storeService.publishStore(req.params.storeId, req.user.userId);
    return res.json(store);
  } catch (error) {
    return sendError(res, error, 'Failed to publish store');
  }
};

const getPublicStore = async (req, res) => {
  try {
    const store = await storeService.getPublicStoreBySlug(req.params.slug);
    return res.json(store);
  } catch (error) {
    return sendError(res, error, 'Failed to fetch public store');
  }
};

const uploadBannerHandler = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const url = `${backendUrl}/uploads/banners/${req.file.filename}`;
  return res.json({ url });
};

module.exports = {
  createStore,
  getMyStore,
  updateMyStore,
  publishStore,
  getPublicStore,
  uploadBannerHandler,
};
