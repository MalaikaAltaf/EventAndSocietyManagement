const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Society', 'Student'], default: 'Student' },
    studentId: { type: String },
    contactNumber: { type: String },
    department: { type: String },
    semester: { type: String },
    registeredEvents: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event' 
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);