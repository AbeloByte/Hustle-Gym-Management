import { z } from "zod";

const createMemberSchema = z
    .object({
        fullName: z
            .string()
            .min(2, "Full name should be at least 2 characters long")
            .optional(),
        name: z
            .string()
            .min(2, "Name should be at least 2 characters long")
            .optional(),
        phone: z.string().min(7, "Phone number is required"),
        email: z.string().email("Invalid email address").optional(),
        gender: z.enum(["MALE", "FEMALE"]),
        dateOfBirth: z.coerce.date().optional(),
        status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED"]).optional(),
    })
    .refine((data) => data.fullName || data.name, {
        message: "fullName or name is required",
        path: ["fullName"],
    });

const updateMemberSchema = z
    .object({
        fullName: z
            .string()
            .min(2, "Full name should be at least 2 characters long")
            .optional(),
        name: z
            .string()
            .min(2, "Name should be at least 2 characters long")
            .optional(),
        phone: z.string().min(7, "Phone number is required").optional(),
        email: z.string().email("Invalid email address").optional().nullable(),
        gender: z.enum(["MALE", "FEMALE"]).optional(),
        dateOfBirth: z.coerce.date().optional(),
        status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED"]).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required to update member",
    });

export { createMemberSchema, updateMemberSchema };
