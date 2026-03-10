import { Router } from "express";
import { createOrderHandler, getMySalesHandler } from "./order.controller";
import { authGuard } from "../../middleware/auth.middleware";

const router = Router();

router.get("/my-sales", authGuard, getMySalesHandler);
// router.get("/my-purchases", authGuard, getMyPurchasesHandler);

export default router;
