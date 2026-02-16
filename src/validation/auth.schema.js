import { z } from "zod";

/**
 * REGISTER
 * POST /auth/register
 */

const registerSchema = z.object({
    name: z.string().min(2, "Name should be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password should be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain uppercase letter")
        .regex(/[0-9]/, "Password must contain number"),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    // status: z.enum(["ACTIVE", "INACTIVE"]),
    // gender: z.enum(["MALE", "FEMALE"]),
});

/**
 * LOGIN
 * POST /auth/login
 */
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password should be at least 8 characters long"),
});

/**
 * CHANGE PASSWORD
 * POST /auth/change-password
 */
const changePasswordSchema = z.object({
    oldpassword: z.string().min(1, "Old password should required"),
    newPassword: z
        .string()
        .min(8, "New password must be 8+ chars")
        .regex(/[A-Z]/, "Must contain uppercase letter")
        .regex(/[0-9]/, "Must contain number"),
});

/**
 *
 * PASSWORD RESET
 * POST /auth/reset-password
 */

export { loginSchema, registerSchema, changePasswordSchema };
