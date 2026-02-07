import express from "express";

import {createGymInfo ,getGymInfo,updateGymInfo } from "../controllers/gym.controller.js";
import authMiddleware from "../middleware/auth.middleware.js"
import roleMiddleware from "../middleware/role.middleware.js"
const router = express.Router();



router.use("/register-gym",authMiddleware, roleMiddleware("ADMIN"), createGymInfo);
router.use("/gym-profile", getGymInfo);
router.use("/update-gym-profile", updateGymInfo);


export default router;
