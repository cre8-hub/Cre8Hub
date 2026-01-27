// src/routes/trend.routes.js
import express from "express";
import { getTrends } from "../controllers/trend.controller.js";

const router = express.Router();

router.get("/youtube", getTrends);

export default router;

