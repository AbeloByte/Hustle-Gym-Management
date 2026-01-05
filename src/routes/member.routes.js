const express = require('express');
const router = express.Router();

const {MemberRegister} = require('../controllers/user.controller');


// member management routes
router.post('/member-register', MemberRegister.createMember);





module.exports = router;
