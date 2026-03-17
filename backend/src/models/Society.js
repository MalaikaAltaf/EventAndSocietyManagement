const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    presidentName: { type: String },
    generalSecretaryName: { type: String },
    mediaLeadName: { type: String },
    eventManagerLeadName: { type: String },
    logoUrl: { type: String, default: 'default-logo.png' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    // Link to the user who manages this society
    adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Society', societySchema);