const { customAlphabet } = require('nanoid');

const generateMemberCode = () => {
    const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
    return `GYM-${nanoid()}`;
};

module.exports = { generateMemberCode };
