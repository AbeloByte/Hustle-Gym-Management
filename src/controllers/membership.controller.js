import * as membershipService from "../services/membership.service.js";

const assignPlanToMember = async (req, res, next) => {
    try {
        const subscription = await membershipService.assignMembership(req.body);

        res.status(201).json({
            success: true,
            message: "Membership assigned successfully",
            data: {
                subscriptionId: subscription.id,
                memberName: subscription.member.fullName, // Change to member.name if that's your schema
                planName: subscription.plan.name,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                status: subscription.status,
            },
        });
    } catch (error) {
        next(error); // Passes to global error handler
    }
};

const checkMemberStatus = async (req, res, next) => {
    try {
        const memberId = parseInt(req.params.memberId, 10);

        if (isNaN(memberId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid Member ID format" });
        }

        const subscription =
            await membershipService.getMemberSubscription(memberId);

        if (!subscription) {
            return res.status(200).json({
                success: true,
                data: {
                    status: "NO_PLAN",
                    message: "No active membership found.",
                },
            });
        }

        // Dynamic Expiration & Future Start Check
        const today = new Date();
        let displayStatus = subscription.status; // It will be 'ACTIVE' in the database
        let message = "Member is active and allowed to enter.";

        if (subscription.status === "ACTIVE") {
            if (today > new Date(subscription.endDate)) {
                displayStatus = "EXPIRED";
                message = "Membership has expired. Please renew.";
            } else if (today < new Date(subscription.startDate)) {
                // NEW LOGIC: The plan is paid for, but hasn't started yet!
                displayStatus = "NOT_STARTED";
                message = `Membership starts in the future on ${subscription.startDate.toDateString()}. Access denied today.`;
            }
        }

        res.status(200).json({
            success: true,
            message: message,
            data: {
                subscriptionId: subscription.id,
                status: displayStatus,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                planName: subscription.plan.name,
            },
        });
    } catch (error) {
        next(error);
    }
};

export { assignPlanToMember, checkMemberStatus };
