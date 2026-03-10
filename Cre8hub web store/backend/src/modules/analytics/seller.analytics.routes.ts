import { Router } from "express";
import { sellerDashboard } from "./seller.analytics.controller";
import { authGuard } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { ROLES } from "../../constants/roles";

const router = Router();

/**
 * GET /api/analytics/seller
 * Seller's personal analytics
 */
router.get(
  "/seller",
  authGuard,
  requireRole([ROLES.SELLER, ROLES.CREATOR]),
  sellerDashboard
);

export default router;