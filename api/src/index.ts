import { Hono } from "hono";
import { serve } from "@hono/node-server";
import * as AuthController from "./modules/auth/auth.controller.js";
import * as DoctorController from "./modules/doctors/doctors.controller.js";
import * as PatientsController from "./modules/patients/patients.controller.js";
import * as SpecialtyController from "./modules/specialties/specialties.controller.js";
import * as DoctorScheduleController from "./modules/doctors_schedules/doctor_schedules.controller.js";
import { logger } from "hono/logger";
import { USER_ROLE } from "./utils/user.js";
import { auth } from "./middleware/auth.middleware.js";

const app = new Hono();
app.use(logger());
app.get("/", (c) => c.text("OK"));

// Auth

app.post("/auth/register", async (c) => {
  return AuthController.register(c);
});

app.post("/auth/login", async (c) => {
  return AuthController.login(c);
});

app.get("/auth/logout", async (c) => {
  return AuthController.logout(c);
});

app.get("/auth/refresh", async (c) => {
  return AuthController.refreshToken(c);
});

// Protect routes

// Patient
// Réservé aux comptes admin et medecin — un patient ne peut pas gérer
// d'autres comptes patients via ces routes.

app.get("/patients", auth([USER_ROLE.DOCTOR, USER_ROLE.ADMIN]), async (c) => {
  return PatientsController.searchPatients(c);
});

app.get("/patients/:id", auth([USER_ROLE.DOCTOR, USER_ROLE.ADMIN]), async (c) => {
  return PatientsController.getPatient(c);
});

app.patch("/patients/:id", auth([USER_ROLE.DOCTOR, USER_ROLE.ADMIN]), async (c) => {
  return PatientsController.updatePatient(c);
});

app.delete("/patients/:id", auth([USER_ROLE.DOCTOR, USER_ROLE.ADMIN]), async (c) => {
  return PatientsController.deletePatient(c);
});

// Doctor
// Réservé aux comptes admin et medecin — un medecin ne peut pas gérer
// d'autres comptes medecins via ces routes.

app.post("/doctor", auth([USER_ROLE.DOCTOR, USER_ROLE.ADMIN]), async (c) => {
  return DoctorController.createDoctor(c);
});

app.get("/doctors", auth(), async (c) => {
  return DoctorController.getDoctors(c);
});

app.get("/doctor/:id", auth(), async (c) => {
  return DoctorController.getDoctorById(c);
});

app.put("/doctor/:id", auth([USER_ROLE.DOCTOR, USER_ROLE.ADMIN]), async (c) => {
  return DoctorController.updateDoctor(c);
});

app.delete("/doctor/:id", auth([USER_ROLE.DOCTOR, USER_ROLE.ADMIN]), async (c) => {
  return DoctorController.deleteDoctor(c);
});

// Specialties
app.get("/specialties", auth(), async (c) => {
  return SpecialtyController.getSpecialties(c);
});

app.get("/specialty/:id", auth(), async (c) => {
  return SpecialtyController.getSpecialtyById(c);
});

app.post("/specialty", auth([USER_ROLE.ADMIN]), async (c) => {
  return SpecialtyController.createSpecialty(c);
});

app.put("/specialty/:id", auth([USER_ROLE.ADMIN]), async (c) => {
  return SpecialtyController.updateSpecialty(c);
});

app.delete("/specialty/:id", auth([USER_ROLE.ADMIN]), async (c) => {
  return SpecialtyController.deleteSpecialty(c);
});

// Doctor Schedules
app.get("/doctor/:doctorId/schedules", auth(), async (c) => {
  return DoctorScheduleController.getSchedulesByDoctor(c);
});

app.post("/doctor-schedules", auth([USER_ROLE.ADMIN, USER_ROLE.DOCTOR]), async (c) => {
  return DoctorScheduleController.createSchedule(c);
});

app.put("/doctor-schedules/:id", auth([USER_ROLE.ADMIN, USER_ROLE.DOCTOR]), async (c) => {
  return DoctorScheduleController.updateSchedule(c);
});

app.delete("/doctor-schedules/:id", auth([USER_ROLE.ADMIN, USER_ROLE.DOCTOR]), async (c) => {
  return DoctorScheduleController.deleteSchedule(c);
});

export default app;

if (process.env.NODE_ENV !== "test") {
  serve({ fetch: app.fetch, port: 3000 });
}
