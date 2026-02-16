import express from "express";
import {
    createMember,
    getMembers,
    getMemberById,
    updateMember,
    deleteMember,
} from "../controllers/member.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
    createMemberSchema,
    updateMemberSchema,
} from "../validation/member.schema.js";

const router = express.Router();

// validate(createMemberSchema),
router.post(
    "/members",
    authMiddleware,
    roleMiddleware("ADMIN", "STAFF"),
    validate(createMemberSchema),
    createMember,
);

router.get(
    "/members",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getMembers,
);

router.get(

    "/members/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "STAFF"),
    getMemberById,
);

router.put(
    "/members/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "STAFF"),
    validate(updateMemberSchema),
    updateMember,
);
router.delete(
    "/members/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "STAFF"),
    deleteMember,
);

export default router;
