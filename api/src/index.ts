import { Hono } from "hono";
import { serve } from "@hono/node-server";
import * as AuthController from "./modules/auth/auth.controller.js";
import * as DoctorController from "./modules/doctors/doctors.controller.js";
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

// Specialties
app.get("/specialties", async (c) => {
  return c.json({ message: "Specialties route accessed" });
});

// Doctor
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

app.delete(
  "/doctor/:id",
  auth([USER_ROLE.DOCTOR, USER_ROLE.ADMIN]),
  async (c) => {
    return DoctorController.deleteDoctor(c);
  },
);

export default app;

if (process.env.NODE_ENV !== "test") {
  serve({ fetch: app.fetch, port: 3000 });
}
