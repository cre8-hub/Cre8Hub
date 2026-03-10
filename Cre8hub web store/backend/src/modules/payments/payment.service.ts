import Stripe from "stripe";
import { pool } from "../../config/db";
import { v4 as uuid } from "uuid";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-01-28.clover",
});

export const createCheckoutSession = async (productId: string, email: string) => {
  // Fetch product + store
  const productRes = await pool.query(
    `SELECT p.*, s.user_id AS seller_id, s.id AS store_id
     FROM products p
     JOIN stores s ON p.store_id = s.id
     WHERE p.id = $1 AND p.is_published = true`,
    [productId]
  );

  if (!productRes.rows.length) {
    throw { status: 404, message: "Product not found or not published" };
  }

  const product = productRes.rows[0];
  const isPhysical = product.product_type === "PHYSICAL";

  // ── Inventory check for physical products ────────────────────────────────
  if (isPhysical && product.inventory !== null) {
    if (product.inventory <= 0) {
      throw { status: 400, message: "This product is out of stock." };
    }
    // Atomically decrement — only if still > 0 (prevents overselling)
    const decRes = await pool.query(
      `UPDATE products SET inventory = inventory - 1
       WHERE id = $1 AND inventory > 0
       RETURNING inventory`,
      [productId]
    );
    if (!decRes.rows.length) {
      throw { status: 400, message: "This product just sold out. Please try again later." };
    }
  }

  const orderId = uuid();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  // Create pending order
  await pool.query(
    `INSERT INTO orders
     (id, user_email, product_id, store_id, total_amount, status, order_type)
     VALUES ($1, $2, $3, $4, $5, 'PENDING', $6)`,
    [orderId, email, product.id, product.store_id, product.price, product.product_type]
  );

  // Only pass image_url to Stripe if it's a real HTTP URL
  const stripeImages =
    product.image_url &&
      (product.image_url.startsWith("http://") || product.image_url.startsWith("https://"))
      ? [product.image_url]
      : undefined;

  // Build Stripe session
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.title,
            ...(product.description ? { description: product.description } : {}),
            ...(stripeImages ? { images: stripeImages } : {}),
          },
          unit_amount: Math.round(Number(product.price) * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: { orderId, productId: product.id, orderType: product.product_type },
    success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/cancel`,
  };

  // Physical products: collect shipping address inside Stripe hosted page
  if (isPhysical) {
    sessionParams.shipping_address_collection = {
      allowed_countries: ["US", "CA", "GB", "AU", "IN", "SG", "DE", "FR", "NL"],
    };
    sessionParams.shipping_options = [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "usd" },
          display_name: `Standard Shipping (ships in ${product.ships_in_days ?? 3} days)`,
          delivery_estimate: {
            minimum: { unit: "business_day", value: product.ships_in_days ?? 3 },
            maximum: { unit: "business_day", value: (product.ships_in_days ?? 3) + 5 },
          },
        },
      },
    ];
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  if (!session.url) {
    throw { status: 500, message: "Stripe did not return a checkout URL." };
  }

  return { url: session.url, orderId };
};

/**
 * Look up order + magic link token from a Stripe session_id
 */
export const getSessionDetails = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const orderId = session.metadata?.orderId;

  if (!orderId) throw { status: 404, message: "No order found for this session" };

  const orderRes = await pool.query(
    `SELECT o.id, o.user_email, o.status, o.total_amount, o.order_type,
            o.shipping_name, o.shipping_line1, o.shipping_city,
            o.shipping_state, o.shipping_zip, o.shipping_country,
            o.tracking_number,
            p.title AS product_title, p.description AS product_description,
            p.ships_in_days,
            ml.token AS magic_token,
            s.store_slug
     FROM orders o
     JOIN products p ON o.product_id = p.id
     JOIN stores s ON s.id = o.store_id
     LEFT JOIN magic_links ml ON ml.order_id = o.id
     WHERE o.id = $1`,
    [orderId]
  );

  if (!orderRes.rows.length) throw { status: 404, message: "Order not found" };

  return orderRes.rows[0];
};