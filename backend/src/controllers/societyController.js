const Society = require('../models/Society');

// @desc    Create a new society (C)
// @route   POST /api/v1/societies
const createSociety = async (req, res) => {
    const { 
        name, 
        description, 
        logoUrl,
        presidentName,
        generalSecretaryName,
        mediaLeadName,
        eventManagerLeadName
    } = req.body;

    if (!name || !description) {
        return res.status(400).json({ message: 'Society name and description are required.' });
    }
    try {
        const societyData = {
            name,
            description,
            logoUrl,
            presidentName,
            generalSecretaryName,
            mediaLeadName,
            eventManagerLeadName,
            adminUserId: req.user._id
        };

        // If an Admin is creating the society, set it to Approved immediately
        if (req.user.role === 'Admin') {
            societyData.status = 'Approved';
        }

        const society = await Society.create(societyData);
        res.status(201).json(society);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A society with this name already exists.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error during society creation.' });
    }
};

// @desc    Get all societies (R)
// @route   GET /api/v1/societies
const getAllSocieties = async (req, res) => {
    try {
        // Only return approved societies for public viewing, or all if Admin
        const filter = req.user && req.user.role === 'Admin' ? {} : { status: 'Approved' };
        const societies = await Society.find(filter);
        res.status(200).json(societies);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching societies.' });
    }
};

// @desc    Update society details (U)
// @route   PUT /api/v1/societies/:id
const updateSociety = async (req, res) => {
    try {
        const society = await Society.findById(req.params.id);
        if (!society) { return res.status(404).json({ message: 'Society not found.' }); }

        if (req.user.role !== 'Admin' && society.adminUserId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this society.' });
        }

        const updatedSociety = await Society.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json(updatedSociety);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during update.' });
    }
};

// @desc    Delete a society (D)
// @route   DELETE /api/v1/societies/:id
const deleteSociety = async (req, res) => {
    try {
        const society = await Society.findById(req.params.id);
        if (!society) { return res.status(404).json({ message: 'Society not found.' }); }

        if (req.user.role !== 'Admin' && society.adminUserId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this society.' });
        }

        await Society.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Society removed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during deletion.' });
    }
};

// @desc    Get my society (R)
// @route   GET /api/v1/societies/me
const getMySociety = async (req, res) => {
    try {
        const society = await Society.findOne({ adminUserId: req.user._id });
        if (!society) {
            return res.status(404).json({ message: 'No society found for this user.' });
        }
        res.status(200).json(society);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching society.' });
    }
};

module.exports = { 
    createSociety,
    getAllSocieties,
    getMySociety,
    updateSociety,
    deleteSociety
};