import { Response } from "express";
import { getAdminDashboard } from "./admin.analytics.service";
import { AuthRequest } from "../../middleware/auth.middleware";

export const adminDashboard = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const data = await getAdminDashboard();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};