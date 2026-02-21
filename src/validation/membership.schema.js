import { z } from "zod";

const assignMembershipSchema = z.object({
    memberId: z
        .number()
        .int()
        .positive({ message: "Member ID must be a positive number" }),
    planId: z
        .number()
        .int()
        .positive({ message: "Plan ID must be a positive number" }),
    startDate: z.iso.datetime().optional(), // Optional: Defaults to today if not provided
});

export { assignMembershipSchema };
