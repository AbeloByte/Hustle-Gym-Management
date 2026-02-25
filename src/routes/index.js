// this is index.js
import express from "express";
import authRoutes from "./auth.routes.js";
import memberRoutes from "./member.routes.js";
import gymProfileRoutes from "./gym.routes.js";
import gymPlan from "./plan.routes.js";
import membershipRoutes from "./membership.routes.js";

const router = express.Router();

router.use("/gym", gymProfileRoutes);
router.use("/auth", authRoutes);
router.use("/gym-members", memberRoutes);
router.use("/membership-plan", gymPlan);
router.use("/membership", membershipRoutes);

router.get("/health", (req, res) => {
    res.status(200).json({ success: true, message: "Server is healthy" });
});

export default router;
