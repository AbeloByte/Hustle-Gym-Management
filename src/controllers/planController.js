const db = require('../config/db');

// @desc    Get all membership plans
// @route   GET /api/plans
const getPlans = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM plans ORDER BY duration_days ASC');
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


modules.exports = {
    getPlans
};
