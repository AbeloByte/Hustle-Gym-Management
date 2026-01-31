// this is index.js
import express from "express"
import authRoutes from "./auth.routes.js"
// import userRoutes from "./user.routes"


const router = express.Router();

router.use("/auth", authRoutes);
// router.use("/users", userRoutes);


export default router;
