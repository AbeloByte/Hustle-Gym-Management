// Business logic for core member management (Separation of Concerns applied)

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Create a new member
 * @param {Object} memberData - { fullName|name, phone, email, gender, dateOfBirth, status }
 */
async function createMemberService(memberData) {
    const {
        fullName,
        name,
        phone,
        email,
        gender,
        status,
        dateOfBirth,
        joinDate,
        planId,
        paymentStatus,
        paymentMethod,
    } = memberData;
    const resolvedFullName = fullName ?? name;

    if (!resolvedFullName || !phone || !gender) {
        throw new Error("fullName (or name), phone, and gender are required");
    }

    try {
        // const parsedDate =
        //     dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);

        // if (Number.isNaN(parsedDate.getTime())) {
        //     throw new Error("dateOfBirth must be a valid date");
        // }

        // Start by creating the member
        const member = await prisma.member.create({
            data: {
                fullName: resolvedFullName,
                phone,
                email,
                gender,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                ...(status ? { status } : {}),
            },
        });

        // If a planId was provided, create a subscription and optional payment
        if (planId) {
            const plan = await prisma.plan.findUnique({
                where: { id: Number(planId) },
            });
            if (!plan) {
                throw new Error("Plan not found");
            }

            const start = joinDate ? new Date(joinDate) : new Date();
            const end = new Date(start);
            end.setDate(end.getDate() + Number(plan.duration || 0));

            const subscription = await prisma.subscription.create({
                data: {
                    memberId: member.id,
                    planId: plan.id,
                    startDate: start,
                    endDate: end,
                    status: "ACTIVE",
                },
            });

            // create payment record linked to the subscription
            await prisma.payment.create({
                data: {
                    subscriptionId: subscription.id,
                    amount: plan.price,
                    method: paymentMethod ? paymentMethod : "CASH",
                    status: paymentStatus ? paymentStatus : "PENDING",
                    paidAt:
                        paymentStatus === "PAID"
                            ? joinDate
                                ? new Date(joinDate)
                                : new Date()
                            : null,
                },
            });
        }

        // return the member with subscriptions loaded
        return await prisma.member.findUnique({
            where: { id: member.id },
            include: { subscriptions: true },
        });
    } catch (error) {
        console.error("Error creating member:", error);

        if (error.code === "P2002" && error.meta?.target?.includes("phone")) {
            throw new Error("Phone already exists");
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
    });
}

/**
 * Get all members
 */
async function getAllMembersService() {
    return await prisma.member.findMany({
        orderBy: { joinDate: "desc" },
    });
}

/**
 * Update member info
 * @param {number|string} memberId
 * @param {Object} updateData - { fullName|name, phone, email, gender, dateOfBirth, status }
 */
async function updateMemberService(memberId, updateData) {
    const { fullName, name, phone, email, gender, dateOfBirth, status } =
        updateData;

    const data = {
        ...(fullName || name ? { fullName: fullName ?? name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(gender !== undefined ? { gender } : {}),
        ...(status !== undefined ? { status } : {}),
    };

    if (dateOfBirth !== undefined) {
        const parsedDate =
            dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);

        if (Number.isNaN(parsedDate.getTime())) {
            throw new Error("dateOfBirth must be a valid date");
        }

        data.dateOfBirth = parsedDate;
    }

    const member = await prisma.member.update({
        where: { id: Number(memberId) },
        data,
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
        data: { status: "SUSPENDED" },
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
