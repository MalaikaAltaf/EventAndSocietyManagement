const User = require('../models/User');
const Society = require('../models/Society'); 
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * @desc    Register a new user and create society if role is Manager
 * @route   POST /api/v1/auth/register
 */
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, department, societyName } = req.body;
        
        // 1. Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please include name, email, and password.' });
        }

        // 2. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Create the User
        const user = await User.create({
            name, 
            email, 
            passwordHash, 
            role: role || 'Student', 
            department
        });

        if (user) {
            let societyId = null;

        // 5. Logic for Society Manager: Create the linked Society record
        if (user.role === 'Society' && societyName) {
            // Check if society name is already taken
                const societyExists = await Society.findOne({ name: societyName });
                if (societyExists) {
                    // Optional: You could delete the user here if you want atomic registration
                    return res.status(400).json({ message: 'Society name already exists. Please choose another.' });
                }

                const newSociety = await Society.create({
                    name: societyName,
                    description: `Official society for ${societyName}`,
                    adminUserId: user._id, // Link to the user we just created
                    status: 'Pending' // Requires Admin approval
                });

                // Notify all Admins about the new society registration
                const adminUsers = await User.find({ role: 'Admin' });
                if (adminUsers && adminUsers.length > 0) {
                    const notificationPromises = adminUsers.map(admin => 
                        Notification.create({
                            recipientId: admin._id,
                            message: `New society registration: "${societyName}" needs your approval.`,
                            type: 'Proposal'
                        })
                    );
                    await Promise.all(notificationPromises);
                }

                societyId = newSociety._id;
            }

            // 6. Send response including societyId (for any society created)
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
                societyId: societyId // Frontend can store this in localStorage immediately
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Login user and fetch their associated society ID
 * @route   POST /api/v1/auth/login
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            
            // Look for a society where this user is the Admin and status is Approved
            const managedSociety = await Society.findOne({ adminUserId: user._id, status: 'Approved' });

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
                // Provide the societyId only if society is approved
                societyId: managedSociety ? managedSociety._id : null
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-passwordHash');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe
};