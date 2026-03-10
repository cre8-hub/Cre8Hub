import { pool } from "../../config/db";

export const getAdminDashboard = async () => {
  const gmvRes = await pool.query(
    `
    SELECT 
      COALESCE(SUM(total_amount),0) as gmv,
      COALESCE(SUM(platform_fee),0) as platform_earnings,
      COUNT(*) as total_orders
    FROM orders
    WHERE payment_status = 'PAID'
    `
  );

  const sellersRes = await pool.query(
    `SELECT COUNT(*) as total_sellers FROM stores`
  );

  return {
    gmv: gmvRes.rows[0].gmv,
    platformEarnings: gmvRes.rows[0].platform_earnings,
    totalOrders: gmvRes.rows[0].total_orders,
    totalSellers: sellersRes.rows[0].total_sellers
  };
};