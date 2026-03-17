const express = require('express');
const { 
    createEvent, 
    getEvents, 
    getMySocietyEvents, 
    getEventById, 
    updateEvent, 
    deleteEvent, 
    registerForEvent, 
    unregisterFromEvent,
    getEventParticipants 
} = require('../controllers/eventController'); 
const { protect, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// READ
router.get('/', getEvents);
router.get('/me', protect, checkRole(['Society']), getMySocietyEvents);
router.get('/:id', getEventById);
router.get('/:id/participants', protect, checkRole(['Admin', 'Society']), getEventParticipants);

// CRUD (Requires Admin or Society Role)
router.post('/', protect, checkRole(['Admin', 'Society']), createEvent); 
router.put('/:id', protect, checkRole(['Admin', 'Society']), updateEvent);
router.delete('/:id', protect, checkRole(['Admin', 'Society']), deleteEvent);

// REGISTRATION (Requires Student Role)
router.post('/:id/register', protect, checkRole(['Student']), registerForEvent);
router.delete('/:id/unregister', protect, checkRole(['Student']), unregisterFromEvent);

module.exports = router;