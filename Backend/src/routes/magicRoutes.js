const express = require('express');
const { verifyMagicLink } = require('../controllers/magicController');

const router = express.Router();

router.get('/:token', verifyMagicLink);

module.exports = router;
