const express = require('express');
const { approveSociety, approveEvent, rejectEvent, getAdminStats } = require('../controllers/adminController');
const { getEvents } = require('../controllers/eventController');
const { getAllSocieties } = require('../controllers/societyController');
const { protect, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes here are restricted to the 'Admin' role
router.use(protect, checkRole(['Admin']));

// Admin Views
router.get('/events', getEvents);
router.get('/societies', getAllSocieties);
router.get('/stats', getAdminStats);

// Admin Approvals
router.put('/societies/:id/approve', approveSociety);
router.put('/events/:id/approve', approveEvent);
router.put('/events/:id/reject', rejectEvent);

module.exports = router;