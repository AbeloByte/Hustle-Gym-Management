const db = require('../config/db');

// @desc    Assign a plan to a member (Subscribe)
// @route   POST /api/memberships
const assignMembership = async (req, res) => {
    try {
        const { member_id, plan_id } = req.body;

        // 1. Get the plan details to know the duration
        const planResult = await db.query('SELECT duration_days FROM plans WHERE id = $1', [plan_id]);
        if (planResult.rowCount === 0) {
            return res.status(404).json({ success: false, error: "Plan not found" });
        }

        const duration = planResult.rows[0].duration_days;
        const start_date = new Date(); // Today

        // 2. Calculate expiry date
        const expiry_date = new Date();
        expiry_date.setDate(start_date.getDate() + duration);

        // 3. Insert into memberships table
        const query = `
            INSERT INTO memberships (member_id, plan_id, start_date, expiry_date, status)
            VALUES ($1, $2, $3, $4, 'active')
            RETURNING *`;
        const values = [member_id, plan_id, start_date, expiry_date];
        const result = await db.query(query, values);

        res.status(201).json({
            success: true,
            message: "Membership assigned successfully",
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

modules.exports = {
    assignMembership
};
