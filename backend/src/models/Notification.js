const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    message: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['Proposal', 'Approval', 'Rejection', 'General'], 
        default: 'General' 
    },
    eventId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event' 
    },
    isRead: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);