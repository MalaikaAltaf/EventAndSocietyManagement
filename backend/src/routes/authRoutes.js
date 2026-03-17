// backend/src/routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', registerUser); // POST /api/v1/auth/signup
router.post('/login', loginUser);     // POST /api/v1/auth/login
router.get('/me', protect, getMe);    // GET /api/v1/auth/me

module.exports = router;