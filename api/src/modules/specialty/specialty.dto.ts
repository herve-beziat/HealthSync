import z from "zod";

export const SpecialtySchema = z.object({
    name: z.string().max(255)
});

export type SpecialtyInput = z.infer<typeof SpecialtySchema>;