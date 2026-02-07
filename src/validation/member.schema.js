import { z } from "zod";

export const createMemberSchema = z.object({
    name: z.string().min(2, "Name should be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password should be at least 6 characters long"),
    role: z.enum(["MEMBER"]),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    gymId: z.string().uuid("Invalid gym ID"),
    gender: z.enum(["MALE", "FEMALE"]),
})
