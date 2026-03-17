// backend/src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Mongoose will read the MONGO_URI from process.env
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        // Exit process with failure
        process.exit(1); 
    }
};

module.exports = connectDB;