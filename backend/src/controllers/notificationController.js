const Notification = require('../models/Notification');

// @desc    Get all notifications for the logged-in user
// @route   GET /api/v1/notifications
const getNotifications = async (req, res) => {
    try {
        // req.user._id comes from your protect middleware
        const notifications = await Notification.find({ recipientId: req.user._id })
            .sort({ createdAt: -1 }) // Newest first
            .limit(20); // Keep it efficient

        res.status(200).json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching notifications.' });
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/v1/notifications/:id/read
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification.' });
    }
};

module.exports = {
    getNotifications,
    markAsRead
};