import { Hono } from "hono";
import { serve } from "@hono/node-server";
import * as AuthController from "./modules/auth/auth.controller.js";
import { logger } from "hono/logger";
import { requireRole } from "./utils/role.js";
import { USER_ROLE } from "./utils/user.js";

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
app.post("/doctor", requireRole(USER_ROLE.DOCTOR), async (c) => {
  return c.json({ message: "Doctor route accessed" });
});

app.get("/doctor", requireRole(USER_ROLE.PATIENT), async (c) => {
  return c.json({ message: "Patient route accessed" });
});

export default app;

if (process.env.NODE_ENV !== "test") {
  serve({ fetch: app.fetch, port: 3000 });
}

