import { Response } from "express";
import {
  createProductService,
  publishProductService,
  updateProductService,
  deleteProductService,
  getMyProductsService,
  updateTrackingService,
} from "./product.service";
import { AuthRequest } from "../../middleware/auth.middleware";

const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";

// ── Image upload ────────────────────────────────────────────────────────────
export const uploadImageHandler = (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const url = `${backendUrl}/uploads/images/${req.file.filename}`;
  res.json({ url });
};

// ── Digital product file upload ─────────────────────────────────────────────
export const uploadFileHandler = (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const url = `${backendUrl}/uploads/files/${req.file.filename}`;
  res.json({ url, originalName: req.file.originalname, size: req.file.size });
};

export const getMyProducts = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    res.json(await getMyProductsService(req.user.id));
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const result = await (await import("../../config/db")).pool.query(
      "SELECT * FROM products WHERE id = $1", [productId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Product not found" });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const {
      storeId, name, title, description, price, image_url, category,
      product_type, file_url, file_name,
      inventory, weight_grams, ships_in_days, sku,
    } = req.body;

    const productTitle = title || name;
    if (!storeId || !productTitle || !price) {
      return res.status(400).json({ message: "Missing required fields: storeId, title/name, price" });
    }

    const product = await createProductService({
      userId: req.user.id,
      storeId,
      title: productTitle,
      description,
      price: Number(price),
      imageUrl: image_url,
      category,
      productType: product_type || "DIGITAL",
      fileUrl: file_url,
      fileName: file_name,
      inventory: inventory !== undefined ? Number(inventory) : undefined,
      weightGrams: weight_grams !== undefined ? Number(weight_grams) : undefined,
      shipsInDays: ships_in_days !== undefined ? Number(ships_in_days) : undefined,
      sku,
    });

    res.status(201).json(product);
  } catch (err: any) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

export const publishProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    res.json(await publishProductService(req.user.id, req.params.productId));
  } catch (err: any) {
    res.status(err.status || 403).json({ message: err.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { name, title, description, price, image_url, category,
      file_url, file_name, inventory, weight_grams, ships_in_days, sku } = req.body;

    const product = await updateProductService(req.user.id, req.params.productId, {
      title: title || name,
      description,
      price: price !== undefined ? Number(price) : undefined,
      imageUrl: image_url,
      category,
      fileUrl: file_url,
      fileName: file_name,
      inventory: inventory !== undefined ? Number(inventory) : undefined,
      weightGrams: weight_grams !== undefined ? Number(weight_grams) : undefined,
      shipsInDays: ships_in_days !== undefined ? Number(ships_in_days) : undefined,
      sku,
    });

    res.json(product);
  } catch (err: any) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    res.json(await deleteProductService(req.user.id, req.params.productId));
  } catch (err: any) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

export const updateTracking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { trackingNumber } = req.body;
    if (!trackingNumber) return res.status(400).json({ message: "trackingNumber is required" });
    res.json(await updateTrackingService(req.user.id, req.params.orderId, trackingNumber));
  } catch (err: any) {
    res.status(err.status || 400).json({ message: err.message });
  }
};