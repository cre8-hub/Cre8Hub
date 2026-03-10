import express from "express";
import { createCheckoutHandler, getSessionDetailsHandler } from "./payment.controller";

const router = express.Router();

/**
 * Create checkout session — NO auth required (public buyers)
 */
router.post("/checkout", createCheckoutHandler);

/**
 * Get session details for success page (magic link token lookup)
 */
router.get("/session/:sessionId", getSessionDetailsHandler);

export default router;
