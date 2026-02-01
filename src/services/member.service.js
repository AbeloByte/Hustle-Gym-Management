import Prisma from "../config/prisma.js"

const createMemberService = async (memberData) => {
    const newMember = await Prisma.member.create({
        data: memberData
    });
    return newMember;
}

const getMembersService = async () => {
    const members = await Prisma.member.findMany();
    return members;
}

const getMemberByIdService = async (memberId) => {
    const member = await Prisma.member.findUnique({
        where: { id: memberId }
    });
    return member;
}

const updateMemberService = async (memberId, memberData) => {
    const updatedMember = await Prisma.member.update({
        where: { id: memberId },
        data: memberData
    });
    return updatedMember;
}

const deleteMemberService = async (memberId) => {
    await Prisma.member.delete({
        where: { id: memberId }
    });
}

export { createMemberService, getMembersService, getMemberByIdService, updateMemberService, deleteMemberService };
