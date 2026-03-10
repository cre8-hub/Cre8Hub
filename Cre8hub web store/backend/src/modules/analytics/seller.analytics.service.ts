import { pool } from "../../config/db";

/**
 * Seller Revenue Analytics
 * - Fixes: owner_id → user_id, payment_status → status
 * - Adds: last-30-days, growth %, daily chart data, top products
 */
export const getSellerDashboard = async (sellerId: string) => {
  // Get seller store (correct column: user_id)
  const storeRes = await pool.query(
    "SELECT id FROM stores WHERE user_id = $1",
    [sellerId]
  );

  const empty = {
    totalRevenue: 0,
    platformFee: 0,
    netEarnings: 0,
    pendingPayout: 0,
    paidPayout: 0,
    totalOrders: 0,
    last30Revenue: 0,
    prev30Revenue: 0,
    revenueGrowth: 0,
    ordersLast30: 0,
    ordersPrev30: 0,
    ordersGrowth: 0,
    chartData: [],
    topProducts: [],
    recentOrders: [],
  };

  if (!storeRes.rows.length) return empty;
  const storeId = storeRes.rows[0].id;

  // ── All-time revenue summary ──────────────────────────────────────────────
  const revenueRes = await pool.query(
    `SELECT
      COALESCE(SUM(total_amount), 0)   AS total_revenue,
      COALESCE(SUM(platform_fee), 0)   AS platform_fee,
      COALESCE(SUM(seller_earning), 0) AS net_earnings,
      COUNT(*)                          AS total_orders
     FROM orders
     WHERE store_id = $1 AND status = 'PAID'`,
    [storeId]
  );

  // ── Last 30 days ──────────────────────────────────────────────────────────
  const last30Res = await pool.query(
    `SELECT
      COALESCE(SUM(total_amount), 0) AS revenue,
      COUNT(*)                        AS orders
     FROM orders
     WHERE store_id = $1
       AND status = 'PAID'
       AND created_at >= NOW() - INTERVAL '30 days'`,
    [storeId]
  );

  // ── Previous 30 days (31-60 days ago) ────────────────────────────────────
  const prev30Res = await pool.query(
    `SELECT
      COALESCE(SUM(total_amount), 0) AS revenue,
      COUNT(*)                        AS orders
     FROM orders
     WHERE store_id = $1
       AND status = 'PAID'
       AND created_at >= NOW() - INTERVAL '60 days'
       AND created_at < NOW() - INTERVAL '30 days'`,
    [storeId]
  );

  // ── Daily chart data (last 30 days) ─────────────────────────────────────
  const chartRes = await pool.query(
    `SELECT
      DATE(created_at)                AS date,
      COALESCE(SUM(seller_earning), 0) AS revenue,
      COUNT(*)                        AS orders
     FROM orders
     WHERE store_id = $1
       AND status = 'PAID'
       AND created_at >= NOW() - INTERVAL '30 days'
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    [storeId]
  );

  // ── Pending payout ───────────────────────────────────────────────────────
  const pendingRes = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS pending
     FROM payouts
     WHERE seller_id = $1 AND status = 'PENDING'`,
    [sellerId]
  );

  // ── Paid payout ──────────────────────────────────────────────────────────
  const paidRes = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS paid
     FROM payouts
     WHERE seller_id = $1 AND status = 'PAID'`,
    [sellerId]
  );

  // ── Top products by revenue ───────────────────────────────────────────────
  const topProductsRes = await pool.query(
    `SELECT
      p.title,
      COUNT(o.id)                        AS sales,
      COALESCE(SUM(o.seller_earning), 0) AS revenue
     FROM orders o
     JOIN products p ON p.id = o.product_id
     WHERE o.store_id = $1 AND o.status = 'PAID'
     GROUP BY p.id, p.title
     ORDER BY revenue DESC
     LIMIT 5`,
    [storeId]
  );

  // ── Recent orders ─────────────────────────────────────────────────────────
  const ordersRes = await pool.query(
    `SELECT
      o.id, o.total_amount, o.seller_earning,
      o.created_at, o.user_email,
      p.title AS product_title
     FROM orders o
     JOIN products p ON p.id = o.product_id
     WHERE o.store_id = $1 AND o.status = 'PAID'
     ORDER BY o.created_at DESC
     LIMIT 10`,
    [storeId]
  );

  // ── Unique customers (distinct buyer emails) ─────────────────────────────
  const customersRes = await pool.query(
    `SELECT COUNT(DISTINCT user_email) AS unique_customers
     FROM orders
     WHERE store_id = $1 AND status = 'PAID'`,
    [storeId]
  );


  const last30Rev = Number(last30Res.rows[0].revenue);
  const prev30Rev = Number(prev30Res.rows[0].revenue);
  const last30Orders = Number(last30Res.rows[0].orders);
  const prev30Orders = Number(prev30Res.rows[0].orders);

  const revenueGrowth =
    prev30Rev === 0
      ? last30Rev > 0 ? 100 : 0
      : Number((((last30Rev - prev30Rev) / prev30Rev) * 100).toFixed(1));

  const ordersGrowth =
    prev30Orders === 0
      ? last30Orders > 0 ? 100 : 0
      : Number((((last30Orders - prev30Orders) / prev30Orders) * 100).toFixed(1));

  return {
    totalRevenue: Number(revenueRes.rows[0].total_revenue),
    platformFee: Number(revenueRes.rows[0].platform_fee),
    netEarnings: Number(revenueRes.rows[0].net_earnings),
    totalOrders: Number(revenueRes.rows[0].total_orders),
    pendingPayout: Number(pendingRes.rows[0].pending),
    paidPayout: Number(paidRes.rows[0].paid),
    last30Revenue: last30Rev,
    prev30Revenue: prev30Rev,
    revenueGrowth,
    ordersLast30: last30Orders,
    ordersPrev30: prev30Orders,
    ordersGrowth,
    chartData: chartRes.rows,
    topProducts: topProductsRes.rows,
    recentOrders: ordersRes.rows,
    uniqueCustomers: Number(customersRes.rows[0].unique_customers),
  };
};