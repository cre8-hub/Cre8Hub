import { Router } from "express";
import {
  createProduct,
  publishProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getProductById,
  updateTracking,
  uploadImageHandler,
  uploadFileHandler,
} from "./product.controller";

import { authGuard } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { ROLES } from "../../constants/roles";
import { uploadImage, uploadFile } from "../../middleware/upload.middleware";

const router = Router();

/**
 * Upload product image
 */
router.post(
  "/upload-image",
  authGuard,
  requireRole([ROLES.SELLER, ROLES.CREATOR]),
  uploadImage,
  uploadImageHandler
);

/**
 * Upload digital product file (PDF, ZIP, MP3, MP4, etc.)
 */
router.post(
  "/upload-file",
  authGuard,
  requireRole([ROLES.SELLER, ROLES.CREATOR]),
  uploadFile,
  uploadFileHandler
);

/**
 * Get current user's products
 */
router.get(
  "/mine",
  authGuard,
  requireRole([ROLES.SELLER, ROLES.CREATOR]),
  getMyProducts
);

/**
 * Get single product by ID
 */
router.get(
  "/:productId",
  authGuard,
  getProductById
);

/**
 * Create Product
 * Seller or Creator can create
 */
router.post(
  "/",
  authGuard,
  requireRole([ROLES.SELLER, ROLES.CREATOR]),
  createProduct
);

/**
 * Publish Product
 */
router.patch(
  "/:productId/publish",
  authGuard,
  requireRole([ROLES.SELLER, ROLES.CREATOR]),
  publishProduct
);

/**
 * Update Product
 */
router.put(
  "/:productId",
  authGuard,
  requireRole([ROLES.SELLER, ROLES.CREATOR]),
  updateProduct
);

/**
 * Delete Product
 */
router.delete(
  "/:productId",
  authGuard,
  requireRole([ROLES.SELLER, ROLES.CREATOR]),
  deleteProduct
);

/**
 * Update tracking number on a physical order
 */
router.patch(
  "/orders/:orderId/tracking",
  authGuard,
  requireRole([ROLES.SELLER, ROLES.CREATOR]),
  updateTracking
);

export default router;