const express = require('express');
const router = express.Router();
const { googleAuth, loginUser, registerUser } = require('../controllers/authController');

// Email/Password authentication
router.post('/register', registerUser);
router.post('/login', loginUser);

// Google OAuth
router.post('/google', googleAuth);

module.exports = router;

