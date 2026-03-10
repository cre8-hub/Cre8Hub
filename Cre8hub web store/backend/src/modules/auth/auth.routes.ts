import express from "express";
import { register, login, getMe } from "./auth.controller";
import { authGuard } from "../../middleware/auth.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authGuard, getMe);

export default router;
