import bcryptjs from 'bcryptjs';
// Business logic for core member management (Separation of Concerns applied)

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Create a new member along with the associated user
 * @param {Object} memberData - { name, email, password, gender, dateOfBirth }
 */
async function createMemberService(memberData) {
  const { name, email, password, gender, dateOfBirth } = memberData;

  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required');
  }

  try {
    const hashedPassword = await bcryptjs.hash(password, 10);

    const member = await prisma.$transaction(async (prismaTx) => {
      const user = await prismaTx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'MEMBER',
        },
      });

      return prismaTx.member.create({
        data: {
          gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          user: {
            connect: { id: user.id },
          },
        },
        include: { user: true },
      });
    });

    return member;
  } catch (error) {
    console.error('Error creating member:', error);

    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      throw new Error('Email already exists');
    }

    throw error;
  }
}


/**
 * Get a single member by ID
 * @param {number|string} memberId
 */
async function getMemberByIdService(memberId) {
  return await prisma.member.findUnique({
    where: { id: Number(memberId) },
    include: { user: true },
  });
}

/**
 * Get all members
 */
async function getAllMembersService() {
  return await prisma.member.findMany({
    include: { user: true },
    orderBy: { joinDate: 'desc' },
  });
}

/**
 * Update member info (and optionally user info)
 * @param {number|string} memberId
 * @param {Object} updateData - { name, email, gender, dateOfBirth, status, userId }
 */
async function updateMemberService(memberId, updateData) {
  const { name, email, gender, dateOfBirth, status, userId } = updateData;

  // Update user info if provided
  if (name || email) {
    await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });
  }

  // Update member info
  const member = await prisma.member.update({
    where: { id: Number(memberId) },
    data: { gender, dateOfBirth, status },
  });

  return member;
}

/**
 * Soft delete a member (change status to SUSPENDED)
 * @param {number|string} memberId
 */

async function deleteMemberService(memberId) {
  return await prisma.member.update({
    where: { id: Number(memberId) },
    data: { status: 'SUSPENDED' },
  });
}


//
export {
  createMemberService,
  getMemberByIdService,
  getAllMembersService,
  updateMemberService,
  deleteMemberService,
};
