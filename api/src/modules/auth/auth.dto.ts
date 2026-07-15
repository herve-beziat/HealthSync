import z from "zod";

export const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(12),
  firstname: z.string(),
  lastname: z.string(),
  phone: z.string(),
  date_of_birth: z.coerce.date({
    error: () => ({ message: "Format de date invalide (attendu: YYYY-MM-DD)" })
  }),
  role: z.literal(["patient", "medecin", "admin"]),
});
export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(12),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = {
  token: string
};
