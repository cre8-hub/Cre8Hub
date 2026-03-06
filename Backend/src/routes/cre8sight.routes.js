const express = require('express');
const router = express.Router();
const { getTrends } = require('../controllers/cre8sight.controller');

router.get('/trends', getTrends);

module.exports = router;
