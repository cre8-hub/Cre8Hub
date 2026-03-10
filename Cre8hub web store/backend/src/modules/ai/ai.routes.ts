import { Router } from "express";
import { generateProductHandler } from "./ai.controller";
import { authGuard } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { ROLES } from "../../constants/roles";

const router = Router();

/**
 * POST /api/v1/ai/generate-product
 * Generates structured digital product content using AI.
 * Requires authentication and CREATOR role.
 */
router.post(
    "/generate-product",
    authGuard,
    requireRole([ROLES.CREATOR]),
    generateProductHandler
);

export default router;
