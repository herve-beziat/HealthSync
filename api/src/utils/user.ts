export enum USER_ROLE {
  "PATIENT" = "patient",
  "MEDECIN" = "medecin",
  "ADMIN" = "admin",
}

export const USER_AVAILABLES_ROLES = [
  USER_ROLE.PATIENT,
  USER_ROLE.MEDECIN,
  USER_ROLE.ADMIN,
] as const;
