import { describe, expect, it, beforeAll } from "vitest";
import app from "../../src/index.js"; 
import { sign } from "hono/jwt";
import { USER_ROLE } from "../../src/utils/user.js";

describe("Specialties CRUD Endpoints", () => {
  let adminToken: string;
  let patientToken: string;
  
  let createdSpecialtyId: number;
  const existingSpecialtyId = 1; 

  beforeAll(async () => {
    const secret = process.env.JWT_SECRET || "supersecretjwtkey";
    
    adminToken = await sign({ userId: "admin-id", role: USER_ROLE.ADMIN, exp: Math.floor(Date.now() / 1000) + 3600 }, secret);
    patientToken = await sign({ userId: "patient-id", role: USER_ROLE.PATIENT, exp: Math.floor(Date.now() / 1000) + 3600 }, secret);
  });

  // --- POST /specialty ---
  describe("POST /specialty", () => {
    it("should allow an admin to create a new specialty", async () => {
      // 💡 Nom unique dynamique pour éviter l'erreur unique Prisma (P2002)
      const uniqueName = `Ophtalmologie-${Date.now()}`;

      const res = await app.request("/specialty", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: uniqueName }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.specialty).toHaveProperty("id");
      
      createdSpecialtyId = body.specialty.id;
    });

    it("should forbid a non-admin user from creating a specialty", async () => {
      const res = await app.request("/specialty", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${patientToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Dentiste" }),
      });

      expect(res.status).toBe(403);
    });

    it("should return 400 if the payload format is invalid (Zod fail)", async () => {
      const res = await app.request("/specialty", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "" }), 
      });

      expect(res.status).toBe(400);
    });
  });

  // --- GET /specialties ---
  describe("GET /specialties", () => {
    it("should allow any authenticated user to fetch all specialties", async () => {
      const res = await app.request("/specialties", {
        method: "GET",
        headers: { "Authorization": `Bearer ${patientToken}` },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("specialties");
    });
  });

  // --- GET /specialty/:id ---
  describe("GET /specialty/:id", () => {
    it("should return a specific specialty by its ID", async () => {
      const targetId = createdSpecialtyId || existingSpecialtyId;
      const res = await app.request(`/specialty/${targetId}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${patientToken}` },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.specialty.id).toBe(targetId);
    });

    it("should return 404 if the specialty does not exist", async () => {
      const res = await app.request("/specialty/99999", {
        method: "GET",
        headers: { "Authorization": `Bearer ${adminToken}` },
      });

      expect(res.status).toBe(404);
    });
  });

  // --- PUT /specialty/:id ---
  describe("PUT /specialty/:id", () => {
    it("should allow an admin to update a specialty name", async () => {
      const targetId = createdSpecialtyId || existingSpecialtyId;
      const uniqueUpdateName = `Neurologie-${Date.now()}`;

      const res = await app.request(`/specialty/${targetId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: uniqueUpdateName }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.specialty.name).toBe(uniqueUpdateName);
    });
  });

  // --- DELETE /specialty/:id ---
  describe("DELETE /specialty/:id", () => {
    it("should forbid a standard user from deleting a specialty", async () => {
      const targetId = createdSpecialtyId || existingSpecialtyId;
      const res = await app.request(`/specialty/${targetId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${patientToken}` },
      });

      expect(res.status).toBe(403);
    });

    it("should allow an admin to delete a specialty", async () => {
      const targetId = createdSpecialtyId || existingSpecialtyId;
      const res = await app.request(`/specialty/${targetId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${adminToken}` },
      });

      expect(res.status).toBe(200);
    });
  });
});