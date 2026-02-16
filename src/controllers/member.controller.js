import {
    createMemberService,
    getAllMembersService,
    getMemberByIdService,
    updateMemberService,
    deleteMemberService,
} from "../services/member.service.js";

// create Member
const createMember = async (req, res, next) => {
    try {
        console.log(req.body);
        const memberData = req.body;
        const newMember = await createMemberService(memberData);
        res.status(201).json(newMember);
    } catch (error) {
        next(error);
    }
};

// get Members
const getMembers = async (req, res, next) => {
    try {
        const members = await getAllMembersService();
        res.status(200).json(members);
    } catch (error) {
        next(error);
    }
};

// get Member by ID
const getMemberById = async (req, res, next) => {
    try {
        const memberId = req.params.id;
        const member = await getMemberByIdService(memberId);
        res.status(200).json(member);
    } catch (error) {
        next(error);
    }
};

// update Member
const updateMember = async (req, res, next) => {
    try {
        const memberId = req.params.id;
        const memberData = req.body;
        const updatedMember = await updateMemberService(memberId, memberData);
        res.status(200).json(updatedMember);
    } catch (error) {
        next(error);
    }
};

// delete Member
const deleteMember = async (req, res, next) => {
    try {
        const memberId = req.params.id;
        await deleteMemberService(memberId);
        res.status(200).json({
            message: `Delete member by ID ${memberId} (stub response)`,
        });
    } catch (error) {
        next(error);
    }
};

export { createMember, getMembers, getMemberById, updateMember, deleteMember };
