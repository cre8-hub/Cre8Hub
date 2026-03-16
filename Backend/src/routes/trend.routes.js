// src/routes/trend.routes.js
const express = require("express");
const { getCre8SightData } = require("../controllers/trend.controller");

const router = express.Router();

router.get("/youtube", getCre8SightData);

module.exports = router;

