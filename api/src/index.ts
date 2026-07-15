import { Hono } from "hono";
import { serve } from "@hono/node-server";
import * as AuthController from "./modules/auth/auth.controller.js";
import { logger } from "hono/logger";

const app = new Hono();
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
app.use(logger());

export default app;
// Start the server on port 3000
serve({ fetch: app.fetch, port: 3000 });
