import { Hono } from "hono";
import { serve } from "@hono/node-server";
import * as AuthController from "./modules/auth/auth.controller.js";
import * as PatientsController from "./modules/patients/patients.controller.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import { requireRole } from "./utils/role.js";
import { logger } from "hono/logger";

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

app.get("/patients/:id", authMiddleware, requireRole(["admin", "medecin"]), async (c) => {
  return PatientsController.getPatient(c);
});

app.patch("/patients/:id", authMiddleware, requireRole(["admin", "medecin"]), async (c) => {
  return PatientsController.updatePatient(c);
});

app.delete("/patients/:id", authMiddleware, requireRole(["admin", "medecin"]), async (c) => {
  return PatientsController.deletePatient(c);
});

export default app;

if (process.env.NODE_ENV !== "test") {
  serve({ fetch: app.fetch, port: 3000 });
}