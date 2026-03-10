import { Request, Response, NextFunction } from "express";
import { pool } from "../config/db";

export const productAccessGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.params;
  const email = req.query.email as string;

  if (!email) {
    return res.status(401).json({ message: "Email required" });
  }

  const result = await pool.query(
    `SELECT 1 FROM orders
     WHERE product_id = $1
       AND user_email = $2
       AND status = 'PAID'`,
    [productId, email]
  );

  if (result.rowCount === 0) {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
};
