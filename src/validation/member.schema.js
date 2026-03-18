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

        phone: z.preprocess(
            (v) => (v == null ? v : String(v)),
            z.string().min(7, "Phone number is required"),
        ),

        email: z.string().email("Invalid email address").optional(),

        gender: z.preprocess(
            (val) => (typeof val === "string" ? val.trim().toUpperCase() : val),
            z.enum(["MALE", "FEMALE"]),
        ),

        dateOfBirth: z.coerce.date().optional(),
        joinDate: z.coerce.date().optional(),

        planId: z.preprocess(
            (v) => (v == null ? v : Number(v)),
            z.number().int().positive().optional(),
        ),

        paymentStatus: z.preprocess(
            (val) => {
                if (typeof val !== "string") return val;
                const v = val.trim().toLowerCase();
                if (v === "paid") return "PAID";
                if (v === "pending") return "PENDING";
                if (v === "overdue" || v === "failed") return "FAILED";
                return val;
            },
            z.enum(["PAID", "PENDING", "FAILED"]).optional(),
        ),

        paymentMethod: z.preprocess(
            (val) => {
                if (typeof val !== "string") return val;
                const v = val.trim().toLowerCase();
                if (v === "cash") return "CASH";
                if (v === "bank_transfer" || v === "bank transfer")
                    return "BANK_TRANSFER";
                if (v === "telebirr" || v === "online") return "ONLINE";
                return val;
            },
            z.enum(["CASH", "ONLINE", "BANK_TRANSFER"]).optional(),
        ),

        status: z.preprocess(
            (val) => {
                if (typeof val !== "string") return val;
                const v = val.trim().toLowerCase();
                if (v === "active") return "ACTIVE";
                if (v === "inactive" || v === "suspended") return "SUSPENDED";
                if (v === "expired") return "EXPIRED";
                return val;
            },
            z.enum(["ACTIVE", "SUSPENDED", "EXPIRED"]).optional(),
        ),
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
        phone: z.preprocess(
            (v) => (v == null ? v : String(v)),
            z.string().min(7, "Phone number is required").optional(),
        ),
        email: z.string().email("Invalid email address").optional().nullable(),
        gender: z.preprocess(
            (val) => (typeof val === "string" ? val.toUpperCase() : val),
            z.enum(["MALE", "FEMALE"]).optional(),
        ),
        dateOfBirth: z.coerce.date().optional(),
        joinDate: z.coerce.date().optional(),
        planId: z.preprocess(
            (v) => (v == null ? v : Number(v)),
            z.number().int().positive().optional(),
        ),
        paymentStatus: z.preprocess(
            (val) => (typeof val === "string" ? val.toUpperCase() : val),
            z.enum(["PAID", "PENDING", "FAILED"]).optional(),
        ),
        paymentMethod: z.preprocess(
            (val) => (typeof val === "string" ? val.toUpperCase() : val),
            z.enum(["CASH", "ONLINE"]).optional(),
        ),
        status: z.preprocess(
            (val) => (typeof val === "string" ? val.toUpperCase() : val),
            z.enum(["ACTIVE", "SUSPENDED", "EXPIRED", "INACTIVE"]).optional(),
        ),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required to update member",
    });

export { createMemberSchema, updateMemberSchema };
