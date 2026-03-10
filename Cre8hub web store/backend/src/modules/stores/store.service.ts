import { pool } from "../../config/db";

/**
 * Update Store settings
 */
export const updateStoreService = async (
  userId: string,
  storeName: string,
  description?: string,
  bannerUrl?: string
) => {
  const store = await pool.query(
    "SELECT * FROM stores WHERE user_id = $1",
    [userId]
  );

  if (store.rows.length === 0) {
    throw { status: 404, message: "Store not found" };
  }

  const updated = await pool.query(
    `UPDATE stores
     SET store_name = $1, description = $2, banner_url = $3
     WHERE user_id = $4
     RETURNING *`,
    [storeName, description ?? store.rows[0].description, bannerUrl ?? store.rows[0].banner_url, userId]
  );

  return updated.rows[0];
};

/**
 * Generate a URL-safe slug from a store name
 */
const generateSlug = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

/**
 * Create Store
 */
export const createStoreService = async (
  userId: string,
  storeName: string
) => {
  const slug = generateSlug(storeName);

  // Check if store name already taken
  const nameCheck = await pool.query(
    "SELECT id FROM stores WHERE store_name = $1",
    [storeName]
  );

  if (nameCheck.rows.length > 0) {
    throw { status: 400, message: "Store name already taken" };
  }

  // Check if user already has a store
  const existingStore = await pool.query(
    "SELECT id FROM stores WHERE user_id = $1",
    [userId]
  );

  if (existingStore.rows.length > 0) {
    throw { status: 400, message: "User already has a store" };
  }

  const result = await pool.query(
    `INSERT INTO stores (id, store_name, store_slug, user_id, is_published)
     VALUES (gen_random_uuid(), $1, $2, $3, false)
     RETURNING *`,
    [storeName, slug, userId]
  );

  return result.rows[0];
};

/**
 * Publish Store
 */
export const publishStoreService = async (
  storeId: string,
  userId: string
) => {
  const store = await pool.query(
    "SELECT * FROM stores WHERE id = $1",
    [storeId]
  );

  if (store.rows.length === 0) {
    throw {
      status: 404,
      message: "Store not found",
    };
  }

  if (store.rows[0].user_id !== userId) {
    throw {
      status: 403,
      message: "Unauthorized",
    };
  }

  const updated = await pool.query(
    "UPDATE stores SET is_published = true WHERE id = $1 RETURNING *",
    [storeId]
  );

  return updated.rows[0];
};

/**
 * Get Public Store by store_slug
 */
export const getPublicStoreService = async (
  slug: string
) => {
  const store = await pool.query(
    `SELECT * FROM stores 
     WHERE store_slug = $1 AND is_published = true`,
    [slug]
  );

  if (store.rows.length === 0) {
    throw {
      status: 404,
      message: "Store not found",
    };
  }

  // Get published products for that store
  const products = await pool.query(
    `SELECT * FROM products
     WHERE store_id = $1 AND is_published = true`,
    [store.rows[0].id]
  );

  return {
    ...store.rows[0],
    products: products.rows,
  };
};

/**
 * Get Store owned by current user
 */
export const getMyStoreService = async (userId: string) => {
  const result = await pool.query(
    "SELECT * FROM stores WHERE user_id = $1",
    [userId]
  );

  if (result.rows.length === 0) {
    throw { status: 404, message: "No store found for this user" };
  }

  return result.rows[0];
};