import { z } from "zod";

export const createMemberSchema = z.object({
 name: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .email("Invalid email format")
    .optional(),

  phone: z
    .string()
    .min(9, "Phone number is too short"),

  gender: z
    .enum(["male", "female"])
    .optional(),

  status: z
    .enum(["active", "inactive"])
    .optional(),

})
