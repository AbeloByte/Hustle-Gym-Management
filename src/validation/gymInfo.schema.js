import { z } from "zod";

const gymInfoSchema = z.object({
    name: z.string().min(4, "Gym name should be at least 4 characters long"),
    address: z.string().min(5, "Address should be at least 5 characters long"),
    phone: z
        .string()
        .min(7, "Phone number should be at least 7 characters long"),
    email: z.string().email("Invalid email address").optional(),
});

export default gymInfoSchema;
