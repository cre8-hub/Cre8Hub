import { pool } from "../../config/db";
import { v4 as uuidv4 } from "uuid";

type ProductType = "DIGITAL" | "PHYSICAL";

interface CreateProductInput {
  userId: string;
  storeId: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: string;
  productType?: ProductType;
  // Digital
  fileUrl?: string;
  fileName?: string;
  // Physical
  inventory?: number;
  weightGrams?: number;
  shipsInDays?: number;
  sku?: string;
}

/**
 * Get all products belonging to the current user's store
 */
export const getMyProductsService = async (userId: string) => {
  const result = await pool.query(
    `SELECT p.*
     FROM products p
     JOIN stores s ON p.store_id = s.id
     WHERE s.user_id = $1
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return result.rows;
};

/**
 * Create Product (Creator/Seller Only) — supports DIGITAL and PHYSICAL
 */
export const createProductService = async (input: CreateProductInput) => {
  const {
    userId, storeId, title, description, price,
    imageUrl, category = "Other",
    productType = "DIGITAL",
    fileUrl, fileName,
    inventory, weightGrams, shipsInDays = 3, sku,
  } = input;

  const store = await pool.query(
    "SELECT * FROM stores WHERE id = $1",
    [storeId]
  );

  if (store.rows.length === 0) throw { status: 404, message: "Store not found" };
  if (store.rows[0].user_id !== userId) throw { status: 403, message: "Unauthorized: you don't own this store" };

  const result = await pool.query(
    `INSERT INTO products
     (id, title, description, price, store_id, is_published,
      image_url, category, product_type,
      file_url, file_name,
      inventory, weight_grams, ships_in_days, sku)
     VALUES ($1, $2, $3, $4, $5, false, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      uuidv4(), title, description, price, storeId,
      imageUrl || null, category, productType,
      fileUrl || null, fileName || null,
      productType === "PHYSICAL" ? (inventory ?? null) : null,
      productType === "PHYSICAL" ? (weightGrams ?? null) : null,
      productType === "PHYSICAL" ? shipsInDays : null,
      sku || null,
    ]
  );

  return result.rows[0];
};

/**
 * Publish Product
 */
export const publishProductService = async (userId: string, productId: string) => {
  const product = await pool.query(
    `SELECT p.*, s.user_id FROM products p JOIN stores s ON p.store_id = s.id WHERE p.id = $1`,
    [productId]
  );
  if (product.rows.length === 0) throw { status: 404, message: "Product not found" };
  if (product.rows[0].user_id !== userId) throw { status: 403, message: "Unauthorized" };

  const updated = await pool.query(
    "UPDATE products SET is_published = true WHERE id = $1 RETURNING *",
    [productId]
  );
  return updated.rows[0];
};

/**
 * Update Product — supports new physical / digital fields
 */
export const updateProductService = async (
  userId: string,
  productId: string,
  updates: {
    title?: string; description?: string; price?: number;
    imageUrl?: string; category?: string;
    fileUrl?: string; fileName?: string;
    inventory?: number; weightGrams?: number; shipsInDays?: number; sku?: string;
  }
) => {
  const product = await pool.query(
    `SELECT p.*, s.user_id FROM products p JOIN stores s ON p.store_id = s.id WHERE p.id = $1`,
    [productId]
  );
  if (product.rows.length === 0) throw { status: 404, message: "Product not found" };
  if (product.rows[0].user_id !== userId) throw { status: 403, message: "Unauthorized" };

  const p = product.rows[0];
  const updated = await pool.query(
    `UPDATE products
     SET title = $1, description = $2, price = $3, image_url = $4, category = $5,
         file_url = $6, file_name = $7,
         inventory = $8, weight_grams = $9, ships_in_days = $10, sku = $11
     WHERE id = $12
     RETURNING *`,
    [
      updates.title ?? p.title,
      updates.description ?? p.description,
      updates.price ?? p.price,
      updates.imageUrl ?? p.image_url,
      updates.category ?? p.category,
      updates.fileUrl ?? p.file_url,
      updates.fileName ?? p.file_name,
      updates.inventory !== undefined ? updates.inventory : p.inventory,
      updates.weightGrams !== undefined ? updates.weightGrams : p.weight_grams,
      updates.shipsInDays !== undefined ? updates.shipsInDays : p.ships_in_days,
      updates.sku ?? p.sku,
      productId,
    ]
  );
  return updated.rows[0];
};

/**
 * Delete Product
 */
export const deleteProductService = async (userId: string, productId: string) => {
  const product = await pool.query(
    `SELECT p.*, s.user_id FROM products p JOIN stores s ON p.store_id = s.id WHERE p.id = $1`,
    [productId]
  );
  if (product.rows.length === 0) throw { status: 404, message: "Product not found" };
  if (product.rows[0].user_id !== userId) throw { status: 403, message: "Unauthorized" };

  await pool.query("DELETE FROM products WHERE id = $1", [productId]);
  return { message: "Product deleted successfully" };
};

/**
 * Update order tracking number (physical orders)
 */
export const updateTrackingService = async (
  userId: string,
  orderId: string,
  trackingNumber: string
) => {
  // Verify the order belongs to the seller's store
  const orderRes = await pool.query(
    `SELECT o.id FROM orders o
     JOIN stores s ON s.id = o.store_id
     WHERE o.id = $1 AND s.user_id = $2`,
    [orderId, userId]
  );
  if (!orderRes.rows.length) throw { status: 404, message: "Order not found or unauthorized" };

  const updated = await pool.query(
    `UPDATE orders SET tracking_number = $1, fulfilled_at = NOW() WHERE id = $2 RETURNING *`,
    [trackingNumber, orderId]
  );
  return updated.rows[0];
};