const express = require('express');
const router = express.Router();
const { createFRA } = require('../controllers/fraController');

router.post('/', createFRA);

module.exports = router;