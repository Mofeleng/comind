import z from "zod";

export const sessionsInsertSchema = z.object({
    name: z.string().min(1, { message: "Name is required"}),
    mindId: z.string().min(1, { message: "Mind is required"})
});

export const sessionsUpdateSchema = sessionsInsertSchema.extend({
    id: z.string().min(1, { message: "ID is required"})
});