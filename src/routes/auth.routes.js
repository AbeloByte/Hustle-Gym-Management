import express from "express"
import { register, login } from "../controllers/auth.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"
import roleMiddleware from "../middleware/role.middleware.js"

const router = express.Router();

// only admin can register new user
// authMiddleware, roleMiddleware("ADMIN")
router.post("/register",   register);
router.post("/login", login)


export default router;
