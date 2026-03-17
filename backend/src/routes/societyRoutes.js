const express = require('express');
const { createSociety, getAllSocieties, getMySociety, updateSociety, deleteSociety } = require('../controllers/societyController'); 
const { protect, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// READ
router.get('/', protect, getAllSocieties); // Protected read to allow Admins to see pending societies
router.get('/me', protect, getMySociety); // Get society for the logged-in manager

// CRUD (Requires Admin or Society Role)
router.post('/', protect, checkRole(['Admin', 'Society']), createSociety);
router.put('/:id', protect, checkRole(['Admin', 'Society']), updateSociety);
router.delete('/:id', protect, checkRole(['Admin', 'Society']), deleteSociety);

module.exports = router;