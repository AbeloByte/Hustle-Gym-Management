import { z } from "zod";

const createPlanSchema = z.object({
    name: z.string().min(3),

    price: z.number().positive(),

    duration: z.number().int().positive(),
});

const updatePlanSchema = z.object({
    name: z.string().min(3).optional(),

    price: z.number().positive().optional(),

    duration: z.number().int().positive().optional(),

    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export { createPlanSchema, updatePlanSchema };
