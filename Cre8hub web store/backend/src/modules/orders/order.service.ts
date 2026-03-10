import { pool } from "../../config/db";
import { v4 as uuidv4 } from "uuid";

/**
 * Create Order (Before Stripe Payment)
 */
export const createOrderService = async (
  userId: string,
  productId: string,
  userEmail: string
) => {
  // Fetch product to get price + store
  const productRes = await pool.query(
    "SELECT id, price, store_id FROM products WHERE id = $1 AND is_published = true",
    [productId]
  );

  if (!productRes.rows.length) {
    throw { status: 404, message: "Product not found" };
  }

  const product = productRes.rows[0];

  const orderId = uuidv4();

  const orderRes = await pool.query(
    `
    INSERT INTO orders 
    (id, user_id, product_id, store_id, total_amount, status, user_email)
    VALUES ($1, $2, $3, $4, $5, 'PENDING', $6)
    RETURNING *
    `,
    [
      orderId,
      userId,
      product.id,
      product.store_id,
      product.price,
      userEmail
    ]
  );

  return orderRes.rows[0];
};

/**
 * Mark Order Paid (Called ONLY from Stripe Webhook)
 * - Idempotent safe
 * - Stores commission
 * - Creates payout ledger entry
 */
export const markOrderPaidService = async (orderId: string) => {
  const orderRes = await pool.query(
    "SELECT * FROM orders WHERE id = $1",
    [orderId]
  );

  if (!orderRes.rows.length) {
    throw { status: 404, message: "Order not found" };
  }

  const order = orderRes.rows[0];

  // 🔒 Idempotency protection
  if (order.status === "PAID") {
    return order;
  }

  if (!order.store_id) {
    throw { status: 500, message: "Order missing store_id" };
  }

  const totalAmount = Number(order.total_amount);

  if (isNaN(totalAmount)) {
    throw { status: 500, message: "Invalid order amount" };
  }

  // 5% platform commission
  const platformFee = Number((totalAmount * 0.05).toFixed(2));
  const sellerEarning = Number((totalAmount - platformFee).toFixed(2));

  // Update order with financial breakdown
  const updatedRes = await pool.query(
    `
    UPDATE orders
    SET status = 'PAID',
        platform_fee = $1,
        seller_earning = $2
    WHERE id = $3
    RETURNING *
    `,
    [platformFee, sellerEarning, orderId]
  );

  const updatedOrder = updatedRes.rows[0];

  // Get seller (store owner)
  const storeRes = await pool.query(
    "SELECT user_id FROM stores WHERE id = $1",
    [order.store_id]
  );

  if (!storeRes.rows.length) {
    throw { status: 500, message: "Store not found" };
  }

  const sellerId = storeRes.rows[0].user_id;

  // Insert payout ledger entry
  await pool.query(
    `
    INSERT INTO payouts (id, seller_id, order_id, amount, status)
    VALUES ($1, $2, $3, $4, 'PENDING')
    `,
    [uuidv4(), sellerId, orderId, sellerEarning]
  );

  return updatedOrder;
};