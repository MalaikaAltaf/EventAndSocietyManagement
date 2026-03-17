const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    bookedSeats: { type: Number, default: 0 },
    tags: [{ type: String }],
    posterUrl: { type: String },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    rejectionReason: { type: String },
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
