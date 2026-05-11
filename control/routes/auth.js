const express = require('express');
const router = express.Router();
const { loginCon, logoutCon } = require('../controllers/authController');

router.post('/login', loginCon.login);
router.post('/logout', logoutCon.logout);

module.exports = router;