import { Router } from "express";
import { authGuard } from "../../middleware/auth.middleware";
import { getCreatorDashboardHandler } from "./creator.controller";

const router = Router();

router.get("/dashboard", authGuard, getCreatorDashboardHandler);

export default router;
