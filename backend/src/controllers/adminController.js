const Society = require('../models/Society');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Approve a society
// @route   PUT /api/v1/admin/societies/:id/approve
// @access  Private/Admin
const approveSociety = async (req, res) => {
    try {
        const society = await Society.findById(req.params.id);
        if (!society) { return res.status(404).json({ message: 'Society not found.' }); }

        society.status = 'Approved';
        await society.save();

        // Notify Society Manager
        if (society.adminUserId) {
            await Notification.create({
                recipientId: society.adminUserId,
                message: `Your society "${society.name}" has been approved. You can now create events.`,
                type: 'Approval'
            });
        }

        res.status(200).json({ message: 'Society approved successfully.', society });
    } catch (error) {
        console.error('Society Approval Error Details:', error);
        res.status(500).json({ message: `Server error during society approval: ${error.message}` });
    }
};

// @desc    Approve an event
// @route   PUT /api/v1/admin/events/:id/approve
// @access  Private/Admin
const approveEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) { return res.status(404).json({ message: 'Event not found.' }); }

        event.status = 'Approved';
        await event.save();

        // Notify Society Manager
        if (event.societyId) {
            const society = await Society.findById(event.societyId);
            if (society && society.adminUserId) {
                await Notification.create({
                    recipientId: society.adminUserId,
                    message: `Your event proposal "${event.title}" has been approved by the Admin.`,
                    type: 'Approval',
                    eventId: event._id
                });
            }
        }

        res.status(200).json({ message: 'Event approved successfully.', event });
    } catch (error) {
        console.error('Approval Error Details:', error);
        res.status(500).json({ message: `Server error during event approval: ${error.message}` });
    }
};

// @desc    Reject an event
// @route   PUT /api/v1/admin/events/:id/reject
// @access  Private/Admin
const rejectEvent = async (req, res) => {
    const { rejectionReason } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (!event) { return res.status(404).json({ message: 'Event not found.' }); }

        event.status = 'Rejected';
        event.rejectionReason = rejectionReason || 'No reason provided by admin.';
        await event.save();

        // Notify Society Manager
        if (event.societyId) {
            const society = await Society.findById(event.societyId);
            if (society && society.adminUserId) {
                await Notification.create({
                    recipientId: society.adminUserId,
                    message: `Your event proposal "${event.title}" has been rejected. Reason: ${event.rejectionReason}`,
                    type: 'Rejection',
                    eventId: event._id
                });
            }
        }

        res.status(200).json({ message: 'Event rejected successfully.', event });
    } catch (error) {
        console.error('Rejection Error Details:', error);
        res.status(500).json({ message: `Server error during event rejection: ${error.message}` });
    }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const totalSocieties = await Society.countDocuments();
        const totalEvents = await Event.countDocuments();
        const totalParticipants = await User.countDocuments({ role: 'Student' });

        res.status(200).json({
            totalSocieties,
            totalEvents,
            totalParticipants
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

module.exports = {
    approveSociety,
    approveEvent,
    rejectEvent,
    getAdminStats
};