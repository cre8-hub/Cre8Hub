import express from "express";
import { authGuard } from "../../middleware/auth.middleware";
import {
  createStore,
  publishStore,
  getPublicStore,
  getMyStore,
  updateStore,
} from "./store.controller";

const router = express.Router();

router.get("/mine", authGuard, getMyStore);
router.patch("/mine", authGuard, updateStore);
router.post("/", authGuard, createStore);
router.post("/:storeId/publish", authGuard, publishStore);
router.get("/public/:slug", getPublicStore);

export default router;
