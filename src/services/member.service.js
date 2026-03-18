import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ===================================== Mapping Functions
function mapMemberStatus(s) {
    if (s === "ACTIVE") return "active";
    return "inactive";
}

function mapPaymentStatus(s) {
    if (s === "PAID") return "paid";
    if (s === "PENDING") return "pending";
    return "overdue";
}

function mapPaymentMethod(m) {
    if (m === "BANK_TRANSFER") return "bank_transfer";
    if (m === "ONLINE") return "telebirr";
    return "cash";
}

function mapMembershipType(planName) {
    const n = (planName ?? "").toLowerCase();
    if (n.includes("premium")) return "Premium";
    if (n.includes("basic")) return "Basic";
    return "Standard";
}
// =====================================

/**
 * Create a new member
 * @param {Object} memberData
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

    const normalizedGender = gender.toUpperCase();
    const normalizedStatus = status ? status.toUpperCase() : "ACTIVE";
    const normalizedPaymentStatus = paymentStatus
        ? paymentStatus.toUpperCase()
        : "PENDING";

    let normalizedPaymentMethod = "CASH"; // default
    if (paymentMethod) {
        const method = String(paymentMethod).toLowerCase();

        if (method === "cash") {
            normalizedPaymentMethod = "CASH";
        } else if (method === "bank_transfer" || method === "bank transfer") {
            normalizedPaymentMethod = "BANK_TRANSFER";
        } else if (method === "telebirr" || method === "online") {
            normalizedPaymentMethod = "ONLINE";
        }
    }

    try {
        // Start by creating the member
        const member = await prisma.member.create({
            data: {
                fullName: resolvedFullName,
                phone,
                email,
                gender: normalizedGender, // Fixed
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                status: normalizedStatus, // Fixed
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
                    status: "ACTIVE", // Schema says ACTIVE, SUSPENDED, EXPIRED
                },
            });

            // create payment record linked to the subscription
            await prisma.payment.create({
                data: {
                    subscriptionId: subscription.id,
                    amount: plan.price,
                    method: normalizedPaymentMethod,
                    status: normalizedPaymentStatus, // Fixed casing
                    paidAt:
                        normalizedPaymentStatus === "PAID"
                            ? joinDate
                                ? new Date(joinDate)
                                : new Date()
                            : null,
                },
            });
        }

        return await prisma.member.findUnique({
            where: { id: member.id },
            include: {
                subscriptions: {
                    include: { payments: true }, // Usually good to include payments too
                },
            },
        });
    } catch (error) {
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
    const id = Number(memberId);

    const member = await prisma.member.findUnique({
        where: { id },
        include: {
            subscriptions: {
                orderBy: { startDate: "desc" },
                include: {
                    plan: true,
                    payments: {
                        orderBy: { paidAt: "desc" },
                    },
                },
            },
            attendances: {
                orderBy: { checkIn: "desc" },
            },
        },
    });

    if (!member) return null;

    const latestSub = member.subscriptions[0];
    const latestPayment = latestSub?.payments?.[0];
    const latestAttendance = member.attendances?.[0];

    const result = {
        id: member.id,
        fullName: member.fullName,
        email: member.email ?? "",
        phone: member.phone,
        gender: member.gender,
        dateOfBirth: member.dateOfBirth,
        joinDate: member.joinDate,
        status: mapMemberStatus(member.status),
        membershipType: mapMembershipType(latestSub?.plan?.name),
        subscription: latestSub
            ? {
                  id: latestSub.id,
                  planId: latestSub.planId,
                  planName: latestSub.plan?.name ?? "",
                  price: latestSub.plan?.price ?? null,
                  duration: latestSub.plan?.duration ?? null,
                  startDate: latestSub.startDate,
                  endDate: latestSub.endDate,
                  status: latestSub.status,
              }
            : null,
        paymentStatus: mapPaymentStatus(latestPayment?.status),
        paymentMethod: mapPaymentMethod(latestPayment?.method),
        lastCheckIn: latestAttendance?.checkIn ?? null,
        attendances: member.attendances,
    };

    return result;
}

/**
 * Get all members
 */
async function getAllMembersService() {
    const rows = await prisma.member.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            subscriptions: {
                orderBy: { startDate: "desc" },
                take: 1,
                include: {
                    plan: true,
                    payments: {
                        orderBy: { paidAt: "desc" },
                        take: 1,
                    },
                },
            },
        },
    });

    return rows.map((m) => {
        const sub = m.subscriptions[0];
        const pay = sub?.payments?.[0];

        return {
            id: m.id,
            fullName: m.fullName,
            email: m.email ?? "",
            phone: m.phone,
            membershipType: mapMembershipType(sub?.plan?.name),
            joinDate: m.joinDate,
            status: mapMemberStatus(m.status), // ACTIVE/SUSPENDED/EXPIRED -> active/inactive
            lastCheckIn: "-", // or derive from Attendance if needed
            paymentStatus: mapPaymentStatus(pay?.status), // PAID/PENDING/FAILED -> paid/pending/overdue
            paymentMethod: mapPaymentMethod(pay?.method), // CASH/BANK_TRANSFER/ONLINE -> cash/bank_transfer/telebirr
        };
    });
}

/**
 * Update member info
 * @param {number|string} memberId
 * @param {Object} updateData
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
    const id = Number(memberId);

    if (!id) {
        throw new Error("Invalid member ID");
    }

    return await prisma.$transaction(async (tx) => {
        // 1. Check member
        const member = await tx.member.findUnique({
            where: { id },
        });

        if (!member) {
            throw new Error("Member not found");
        }

        // 2. Get subscriptions
        const subscriptions = await tx.subscription.findMany({
            where: { memberId: id },
            select: { id: true },
        });

        const subscriptionIds = subscriptions.map((sub) => sub.id);

        // 3. Delete payments FIRST (deepest level)
        if (subscriptionIds.length > 0) {
            await tx.payment.deleteMany({
                where: {
                    subscriptionId: { in: subscriptionIds },
                },
            });
        }

        // 4. Delete subscriptions
        await tx.subscription.deleteMany({
            where: { memberId: id },
        });

        // 5. Delete member
        const deletedMember = await tx.member.delete({
            where: { id },
        });

        return deletedMember;
    });
}

export {
    createMemberService,
    getMemberByIdService,
    getAllMembersService,
    updateMemberService,
    deleteMemberService,
};
