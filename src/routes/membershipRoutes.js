const express = require('express');
const router = express.Router();
const { assignMembership } = require('../controllers/membershipController');

router.post('/', assignMembership);
module.exports = router;
