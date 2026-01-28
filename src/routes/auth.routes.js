import express from "express"
import { register, login } from "../services/auth.service"
import authMiddleware from "../middleware/auth.middleware"
import roleMiddleware from "../middleware/role.middleware"

const router = express.Router();

// only admin can register new user

router.post("/register", authMiddleware, roleMiddleware("ADMIN"), register);
router.post("/login", login)

export default router;
