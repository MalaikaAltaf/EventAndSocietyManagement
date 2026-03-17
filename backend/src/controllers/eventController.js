const Event = require('../models/Event');
const User = require('../models/User'); 
const Notification = require('../models/Notification');
const Society = require('../models/Society');

/**
 * @desc    Create a new event (C)
 * @route   POST /api/v1/events
 * @access  Private (Society Manager)
 */
const createEvent = async (req, res) => {
    const { title, description, date, time, venue, totalSeats, tags, posterUrl, societyId } = req.body;
    
    try {
        // Validation: Ensure mandatory fields are present
        if (!title || !date || !totalSeats || !societyId) {
            return res.status(400).json({ message: 'Missing required event fields: Title, Date, Total Seats, and Society ID are mandatory.' });
        }

        // 1. Create the event in MongoDB
        const event = await Event.create({
            title, 
            description, 
            date, 
            time, 
            venue, 
            totalSeats, 
            tags, 
            posterUrl, 
            societyId,
            status: 'Pending' // Explicitly set to Pending
        });

        // 2. NOTIFICATION LOGIC: Notify all Admins about the new proposal
        const adminUsers = await User.find({ role: 'Admin' });

        if (adminUsers && adminUsers.length > 0) {
            const notificationPromises = adminUsers.map(admin => 
                Notification.create({
                    recipientId: admin._id,
                    message: `New event proposal: "${title}" has been submitted and needs your review.`,
                    type: 'Proposal',
                    eventId: event._id
                })
            );
            await Promise.all(notificationPromises);
        }

        // 3. Send successful creation response
        res.status(201).json(event);

    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ message: 'Server error during event creation.' });
    }
};

/**
 * @desc    Get all events (R)
 * @route   GET /api/v1/events
 * @access  Public (only Approved), Private/Admin (All)
 */
const getEvents = async (req, res) => {
    try {
        // If the user is an Admin, they can see ALL events (Pending, Approved, Rejected)
        // Otherwise, only show Approved events
        const filter = (req.user && req.user.role === 'Admin') ? {} : { status: 'Approved' };
        
        const events = await Event.find(filter).populate('societyId', 'name logoUrl');
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching events.' });
    }
};

/**
 * @desc    Get events for the logged-in society manager
 * @route   GET /api/v1/events/me
 * @access  Private (Society Manager)
 */
const getMySocietyEvents = async (req, res) => {
    try {
        // Return all events in the database, regardless of society
        const events = await Event.find({});
        res.status(200).json(events);
    } catch (error) {
        console.error('Fetch My Events Error:', error);
        res.status(500).json({ message: 'Server error fetching events.' });
    }
};

/**
 * @desc    Get a single event by ID (R)
 * @route   GET /api/v1/events/:id
 * @access  Public
 */
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('societyId', 'name description');
        
        if (event) {
            res.status(200).json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching event.' });
    }
};

/**
 * @desc    Update event details (U)
 * @route   PUT /api/v1/events/:id
 * @access  Private (Admin/Society Manager)
 */
const updateEvent = async (req, res) => {
    try {
        // 1. Find existing event to check current status before updating
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        // 2. Update the document with new data
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        // 3. NOTIFICATION LOGIC: If the status was changed (e.g., Approved or Rejected)
        if (req.body.status && req.body.status !== event.status) {
            // Find the society linked to this event to get the manager's ID
            const society = await Society.findById(updatedEvent.societyId);
            
            if (society && society.adminUserId) {
                await Notification.create({
                    recipientId: society.adminUserId, // Notifies the Society Head (adminUserId)
                    message: `Your event proposal "${updatedEvent.title}" has been ${req.body.status.toLowerCase()} by the Admin.`,
                    type: req.body.status === 'Approved' ? 'Approval' : 'Rejection',
                    eventId: updatedEvent._id
                });
            }
        }

        res.status(200).json(updatedEvent);
    } catch (error) {
        console.error('Update Event Error:', error);
        res.status(500).json({ message: 'Server error during update.' });
    }
};

/**
 * @desc    Delete an event (D)
 * @route   DELETE /api/v1/events/:id
 * @access  Private (Admin/Society Manager)
 */
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }
        
        await Event.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Event removed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during deletion.' });
    }
};

// ----------------- REGISTRATION LOGIC -----------------

const registerForEvent = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user._id;
    const { name, studentId, contactNumber, department, semester } = req.body;

    try {
        const event = await Event.findById(eventId);
        if (!event) { return res.status(404).json({ message: 'Event not found.' }); }

        if (event.bookedSeats >= event.totalSeats) {
            return res.status(400).json({ message: 'Event is full.' });
        }
        
        const user = await User.findById(userId);

        if (user.registeredEvents.includes(eventId)) {
            return res.status(400).json({ message: 'Already registered for this event.' });
        }

        // Update student profile details during registration
        if (name) user.name = name;
        if (studentId) user.studentId = studentId;
        if (contactNumber) user.contactNumber = contactNumber;
        if (department) user.department = department;
        if (semester) user.semester = semester;

        event.bookedSeats += 1;
        await event.save();
        
        user.registeredEvents.push(eventId);
        await user.save();

        res.status(200).json({ message: 'Registered successfully!', event });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Registration error.' });
    }
};

const unregisterFromEvent = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user._id;

    try {
        const event = await Event.findById(eventId);
        if (!event) { return res.status(404).json({ message: 'Event not found.' }); }

        const user = await User.findById(userId);
        if (!user.registeredEvents.includes(eventId)) {
            return res.status(400).json({ message: 'Not registered for this event.' });
        }

        if (event.bookedSeats > 0) {
            event.bookedSeats -= 1;
            await event.save();
        }

        user.registeredEvents.pull(eventId);
        await user.save();

        res.status(200).json({ message: 'Unregistered successfully!', event });

    } catch (error) {
        res.status(500).json({ message: 'Unregistration error.' });
    }
};

/**
 * @desc    Get participants for a specific event
 * @route   GET /api/v1/events/:id/participants
 * @access  Private (Admin/Society Manager)
 */
const getEventParticipants = async (req, res) => {
    try {
        const participants = await User.find({ 
            registeredEvents: req.params.id,
            role: 'Student'
        }).select('name studentId department semester contactNumber createdAt');
        res.status(200).json(participants);
    } catch (error) {
        console.error('Fetch Participants Error:', error);
        res.status(500).json({ message: 'Error fetching participants.' });
    }
};

module.exports = {
    createEvent,
    getEvents,
    getMySocietyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    getEventParticipants
};