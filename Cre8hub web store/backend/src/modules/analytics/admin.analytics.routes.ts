import { Router } from "express";
import { adminDashboard } from "./admin.analytics.controller";
import { authGuard } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { ROLES } from "../../constants/roles";

const router = Router();

router.get(
  "/admin",
  authGuard,
  requireRole([ROLES.ADMIN]),
  adminDashboard
);

export default router;