// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Load environment variables (must be called before accessing process.env)
dotenv.config();

// Initialize Express App
const app = express();

// Database Connection
connectDB(); 

// --- Core Middleware ---
// 1. CORS: Allows your frontend (on a different port) to access the API.
app.use(cors()); 

// 2. Body Parser: Allows the server to accept JSON data in the request body.
app.use(express.json());

// --- Routes (API Endpoints) ---
// Define your central API router here (we'll create this next)
const apiRoutes = require('./src/routes/api');
app.use('/api/v1', apiRoutes); 

// Simple Test Route
app.get('/', (req, res) => {
    res.send('Event & Society Management API is running...');
});

// --- Start the Server ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});