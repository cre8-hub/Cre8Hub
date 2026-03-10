import express from "express";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import routes from "./routes";
import "./config/db";
import { stripeWebhookHandler } from "./modules/payments/payment.webhook";

dotenv.config();

const app = express();

/**
 * 🔥 STRIPE WEBHOOK MUST COME FIRST
 * and MUST use raw body
 */
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);

/**
 * Security middlewares
 */
app.use(helmet());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://cre8hub.vercel.app"],
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

/**
 * Normal JSON parsing AFTER webhook
 */
app.use(express.json());

/**
 * Serve uploaded files (product images & digital files)
 */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/**
 * Main API routes
 */
app.use("/api/v1", routes);

/**
 * Global Error Handler
 */
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

export default app;