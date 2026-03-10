import { Request, Response } from "express";
import { createOrderService } from "./order.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { pool } from "../../config/db";

/**
 * Get orders for the seller's store products
 */
export const getMySalesHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT o.*
       FROM orders o
       JOIN products p ON o.product_id = p.id
       JOIN stores s ON p.store_id = s.id
       WHERE s.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to fetch sales" });
  }
};


/**
 * Create Order (Before Stripe Checkout)
 */
export const createOrderHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID required" });
    }

    const order = await createOrderService(
      req.user.id,
      productId,
      req.user.email
    );

    res.status(201).json(order);
  } catch (err: any) {
    res.status(err.status || 500).json({
      message: err.message || "Failed to create order"
    });
  }
};