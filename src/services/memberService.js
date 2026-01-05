const memberModel = require('../Models/memberModel');
const { customAlphabet } = require('nanoid');

class MemberService {
    async registerMember(data) {
        // Business Rule: Generate a unique 8-character ID for the QR code
        const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
        const member_code = `GYM-${nanoid()}`;

        const newMember = await memberModel.createUser({
            ...data,
            member_code
        });

        return newMember;
    }

    async getAllMembers() {
        return await memberModel.findAll();
    }
}

module.exports = new MemberService();
