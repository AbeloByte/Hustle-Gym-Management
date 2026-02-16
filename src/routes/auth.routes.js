import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import { registerSchema, loginSchema } from "../validation/auth.schema.js";
import validate from "../middleware/validation.middleware.js";
const router = express.Router();

// only admin can register new user
// authMiddleware, roleMiddleware("ADMIN")
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;
