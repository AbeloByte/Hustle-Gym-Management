const memberService = require('../services/memberService');

const createMember = async (req, res) => {
    try {
        const member = await memberService.registerMember(req.body);
        res.status(201).json({ success: true, data: member });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message.includes('unique') ? 'Phone number already registered' : 'Server Error'
        });
    }
};

const getMembers = async (req, res) => {
    try {
        const members = await memberService.getAllMembers();
        res.status(200).json({ success: true, count: members.length, data: members });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


modules.exports = {createMember, getMembers}
