import prisma from "../config/prisma.js"; // Using your singleton

const assignMembership = async (data) => {
    const { memberId, planId, startDate } = data;

    // 1. Verify the Member exists
    const member = await prisma.member.findUnique({
        where: { id: memberId },
    });
    if (!member) {
        const error = new Error("Member not found");
        error.statusCode = 404;
        throw error;
    }

    // 2. Verify the Plan exists
    const plan = await prisma.plan.findUnique({
        where: { id: planId },
    });
    if (!plan) {
        const error = new Error("Membership plan not found");
        error.statusCode = 404;
        throw error;
    }

    // 3. Check if member already has an ACTIVE subscription
    const existingActiveSub = await prisma.subscription.findFirst({
        where: {
            memberId: memberId,
            status: "ACTIVE",
        },
    });

    if (existingActiveSub) {
        const error = new Error(
            "Member already has an active subscription. Please renew or cancel the existing one.",
        );
        error.statusCode = 400;
        throw error;
    }

    // 4. Calculate Dates
    // If no startDate provided, use today (Feb 21, 2026 based on our timeline)
    const start = startDate ? new Date(startDate) : new Date();

    // Calculate End Date based on the Plan's duration (e.g., 30 days)
    const end = new Date(start);
    end.setDate(end.getDate() + plan.duration);
    // Note: ensure your Plan model has a field like 'duration_days' or 'duration'. Adjust if named differently.

    // 5. Create the Subscription
    const subscription = await prisma.subscription.create({
        data: {
            memberId: memberId,
            planId: planId,
            startDate: start,
            endDate: end,
            status: "ACTIVE",
        },
        include: {
            plan: { select: { name: true, price: true } }, // Pull plan details for the response
            member: { select: { fullName: true } }, // Adjust to 'name' if your Member model uses 'name'
        },
    });

    return subscription;
};

// Get a member's current subscription
const getMemberSubscription = async (memberId) => {
    return await prisma.subscription.findFirst({
        where: { memberId: memberId },
        orderBy: { endDate: "desc" }, // Get the most recent one
        include: {
            plan: { select: { name: true } },
        },
    });
};

export { assignMembership, getMemberSubscription };
