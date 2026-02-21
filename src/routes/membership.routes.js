import { Router } from "express";
import {
    assignPlanToMember,
    checkMemberStatus,
} from "../controllers/membership.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";
import { assignMembershipSchema } from "../validation/membership.schema.js";

const router = Router();

// Endpoint to assign a new subscription plan to a member
router.post(
    "/assign",
    authMiddleware,
    roleMiddleware("ADMIN", "STAFF"),
    validate(assignMembershipSchema), // Validates body has integer memberId and planId
    assignPlanToMember,
);

// Endpoint for staff to check a member's current status (when they walk in)
router.get(
    "/status/:memberId",
    authMiddleware,
    roleMiddleware("ADMIN", "STAFF"),
    checkMemberStatus,
);

export default router;
