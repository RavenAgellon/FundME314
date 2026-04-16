const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/authController');

// POST /api/auth/login — handles login for all roles
router.post('/login', login);

// POST /api/auth/logout — handles logout for all roles
router.post('/logout', logout);

module.exports = router;