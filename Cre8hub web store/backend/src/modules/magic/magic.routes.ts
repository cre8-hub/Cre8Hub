import express from "express";
import { verifyMagicLinkHandler } from "./magic.controller";

const router = express.Router();

/**
 * GET /magic/:token — Verify a magic link and return order + product info
 */
router.get("/:token", verifyMagicLinkHandler);

export default router;
