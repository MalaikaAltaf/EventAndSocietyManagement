const express = require('express');
const authRoutes = require('./authRoutes');
const societyRoutes = require('./societyRoutes');
const eventRoutes = require('./eventRoutes');
const adminRoutes = require('./adminRoutes');
const notificationRoutes = require('./notificationRoutes'); // 1. Import the new routes

const router = express.Router();

// Define main API endpoints
router.use('/auth', authRoutes);
router.use('/societies', societyRoutes);
router.use('/events', eventRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes); // 2. Mount it here

module.exports = router;