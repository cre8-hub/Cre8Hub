import { Request, Response } from "express";
import { pool } from "../../config/db";

export const verifyMagicLinkHandler = async (
  req: Request,
  res: Response
) => {
  const { token } = req.params;

  const result = await pool.query(
    `SELECT
      o.product_id,
      o.user_email,
      o.total_amount,
      p.title as product_title,
      p.description as product_description
    FROM magic_links m
    JOIN orders o ON o.id = m.order_id
    JOIN products p ON p.id = o.product_id
    WHERE m.token = $1
      AND (m.expires_at IS NULL OR m.expires_at > now())`,
    [token]
  );

  if (result.rows.length === 0) {
    return res.status(400).json({ message: "Invalid or expired link" });
  }

  res.json(result.rows[0]);
};
