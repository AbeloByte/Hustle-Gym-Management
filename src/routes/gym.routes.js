import express from "express";

import {
    createGymInfo,
    getGymInfo,
    updateGymInfo,
} from "../controllers/gym.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";
import gymInfoSchema from "../validation/gymInfo.schema.js";

const router = express.Router();

// router.use("/register-gym", authMiddleware, createGymInfo);
router.use("/register-gym", validate(gymInfoSchema), createGymInfo);
router.get("/gym-profile", authMiddleware, roleMiddleware("ADMIN"), getGymInfo);
router.use(
    "/update-gym-profile",
    validate(gymInfoSchema),
    authMiddleware,
    roleMiddleware("ADMIN"),
    updateGymInfo,
);

export default router;
