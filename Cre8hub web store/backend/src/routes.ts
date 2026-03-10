import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import storeRoutes from "./modules/stores/store.routes";
import productRoutes from "./modules/products/product.routes";
import paymentRoutes from "./modules/payments/payment.routes";
import orderRoutes from "./modules/orders/order.routes";
import creatorRoutes from "./modules/creator/creator.routes";
import sellerAnalyticsRoutes from "./modules/analytics/seller.analytics.routes";
import adminAnalyticsRoutes from "./modules/analytics/admin.analytics.routes";
import magicRoutes from "./modules/magic/magic.routes";
import aiRoutes from "./modules/ai/ai.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/stores", storeRoutes);
router.use("/products", productRoutes);
router.use("/payments", paymentRoutes);
router.use("/orders", orderRoutes);
router.use("/api/creator", creatorRoutes);
router.use("/analytics", sellerAnalyticsRoutes);
router.use("/analytics/admin", adminAnalyticsRoutes);
router.use("/magic", magicRoutes);
router.use("/ai", aiRoutes);

export default router;
