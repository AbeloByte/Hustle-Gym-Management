// this is index.js
import express from "express"
import authRoutes from "./auth.routes.js"
import memberRoutes from "./member.routes.js"
import gymProfileRoutes from "./gym.routes.js"

const router = express.Router();

router.use('/gym',gymProfileRoutes);
router.use("/auth", authRoutes);
router.use("/gym-members", memberRoutes);



export default router;
