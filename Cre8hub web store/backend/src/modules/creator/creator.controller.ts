import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { pool } from "../../config/db";

export const getCreatorDashboardHandler = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const creatorId = req.user.id;

  const result = await pool.query(
    `
    SELECT 
      p.id,
      p.title,
      p.price,
      p.is_published,
      COUNT(o.id) FILTER (WHERE o.status = 'PAID') AS sales,
      COALESCE(SUM(o.amount) FILTER (WHERE o.status = 'PAID'), 0) AS revenue
    FROM products p
    JOIN stores s ON s.id = p.store_id
    LEFT JOIN orders o ON o.product_id = p.id
    WHERE s.user_id = $1
    GROUP BY p.id
    ORDER BY p.created_at DESC
    `,
    [creatorId]
  );

  res.json(result.rows);
};
