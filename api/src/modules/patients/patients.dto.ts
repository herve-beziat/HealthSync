import z from "zod";

/**
 * Valide le paramètre :id des routes /patients/:id — doit être un UUID.
 * Évite d'envoyer une requête Prisma avec un id manifestement invalide.
 */
export const PatientIdParamSchema = z.object({
  id: z.uuid(),
});

/**
 * Schéma de validation pour PATCH /patients/:id.
 * Tous les champs sont optionnels (modification partielle) — l'admin ne
 * renseigne que ce qu'il veut changer. Pas de "password" ni "role" ici :
 * hors périmètre de cette US (CRUD sur les infos personnelles du patient).
 * .refine() empêche un body vide (au moins un champ à modifier).
 */
export const UpdatePatientSchema = z
  .object({
    email: z.email(),
    firstname: z.string(),
    lastname: z.string(),
    phone: z.string(),
    date_of_birth: z.coerce.date({
      error: () => ({ message: "Format de date invalide (attendu: YYYY-MM-DD)" })
    }),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être renseigné pour la modification",
  });

export type PatientIdParam = z.infer<typeof PatientIdParamSchema>;
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>;