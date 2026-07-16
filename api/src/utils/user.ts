export enum USER_ROLE {
  "PATIENT" = "patient",
  "DOCTOR" = "medecin",
  "ADMIN" = "admin",
}

export const USER_AVAILABLES_ROLES = [
  USER_ROLE.PATIENT,
  USER_ROLE.DOCTOR,
  USER_ROLE.ADMIN,
] as const;
