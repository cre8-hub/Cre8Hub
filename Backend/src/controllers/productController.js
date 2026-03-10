const productService = require('../services/productService');
const orderService = require('../services/orderService');
const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;

const sendError = (res, error, fallbackMessage = 'Product request failed') => {
  const status = error.status || 500;
  return res.status(status).json({ message: error.message || fallbackMessage });
};

const getMyProducts = async (req, res) => {
  try {
    const products = await productService.getMyProducts(req.user.userId);
    return res.json(products);
  } catch (error) {
    return sendError(res, error, 'Failed to fetch products');
  }
};

const getProductById = async (req, res) => {
  try {
    const requesterId = req.user?.userId || null;
    const product = await productService.getProductById(req.params.productId, requesterId);

    return res.json(product);
  } catch (error) {
    return sendError(res, error, 'Failed to fetch product');
  }
};

const createProduct = async (req, res) => {
  try {
    const payload = {
      storeId: req.body.storeId,
      title: req.body.title ?? req.body.name,
      description: req.body.description,
      price: req.body.price,
      imageUrl: req.body.imageUrl ?? req.body.image_url,
      category: req.body.category,
      productType: req.body.productType ?? req.body.product_type,
      fileUrl: req.body.fileUrl ?? req.body.file_url,
      fileName: req.body.fileName ?? req.body.file_name,
      inventory: req.body.inventory,
      shipsInDays: req.body.shipsInDays ?? req.body.ships_in_days,
      sku: req.body.sku,
    };

    const product = await productService.createProduct(req.user.userId, payload);

    return res.status(201).json(product);
  } catch (error) {
    return sendError(res, error, 'Failed to create product');
  }
};

const updateProduct = async (req, res) => {
  try {
    const payload = {
      title: req.body.title ?? req.body.name,
      description: req.body.description,
      price: req.body.price,
      imageUrl: req.body.imageUrl ?? req.body.image_url,
      category: req.body.category,
      productType: req.body.productType ?? req.body.product_type,
      fileUrl: req.body.fileUrl ?? req.body.file_url,
      fileName: req.body.fileName ?? req.body.file_name,
      inventory: req.body.inventory,
      shipsInDays: req.body.shipsInDays ?? req.body.ships_in_days,
      sku: req.body.sku,
    };

    const product = await productService.updateProduct(req.user.userId, req.params.productId, payload);

    return res.json(product);
  } catch (error) {
    return sendError(res, error, 'Failed to update product');
  }
};

const publishProduct = async (req, res) => {
  try {
    const product = await productService.publishProduct(req.user.userId, req.params.productId);

    return res.json(product);
  } catch (error) {
    return sendError(res, error, 'Failed to publish product');
  }
};

const deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.user.userId, req.params.productId);

    return res.json(result);
  } catch (error) {
    return sendError(res, error, 'Failed to delete product');
  }
};

const uploadImageHandler = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const url = `${backendUrl}/uploads/images/${req.file.filename}`;
  return res.json({ url });
};

const uploadFileHandler = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const url = `${backendUrl}/uploads/files/${req.file.filename}`;
  return res.json({ url, originalName: req.file.originalname, size: req.file.size });
};

const updateTracking = async (req, res) => {
  try {
    const { trackingNumber } = req.body;
    if (!trackingNumber) {
      return res.status(400).json({ message: 'trackingNumber is required' });
    }
    const updated = await orderService.updateTracking(req.user.userId, req.params.orderId, trackingNumber);
    return res.json(updated);
  } catch (error) {
    return sendError(res, error, 'Failed to update tracking');
  }
};

module.exports = {
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  publishProduct,
  deleteProduct,
  uploadImageHandler,
  uploadFileHandler,
  updateTracking,
};
