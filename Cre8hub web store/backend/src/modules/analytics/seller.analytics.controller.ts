import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { getSellerDashboard } from "./seller.analytics.service";

export const sellerDashboard = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = await getSellerDashboard(req.user.id);

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};