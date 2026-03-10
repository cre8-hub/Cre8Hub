import { Request, Response } from "express";
import { createCheckoutSession, getSessionDetails } from "./payment.service";

export const createCheckoutHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { productId, email } = req.body;

    if (!productId || !email) {
      return res.status(400).json({ message: "productId and email are required" });
    }

    const { url, orderId } = await createCheckoutSession(productId, email);
    res.json({ url, orderId });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || "Checkout failed" });
  }
};

export const getSessionDetailsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { sessionId } = req.params;
    const details = await getSessionDetails(sessionId);
    res.json(details);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || "Session lookup failed" });
  }
};
