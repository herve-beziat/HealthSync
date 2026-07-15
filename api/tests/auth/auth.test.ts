import { describe, expect, it, beforeAll, afterAll } from "vitest";
import app from "../../src/index.js";
import { prisma } from "../../src/utils/prisma.js";

describe("Auth System", () => {
  const testUser = {
    email: "test@example.com",
    password: "Password123456!",
    firstname: "Test",
    lastname: "User",
    phone: "0102030405",
    date_of_birth: "1990-01-01",
    role: "patient",
  };

  beforeAll(async () => {
    await prisma.refresh_tokens.deleteMany();
    await prisma.users.deleteMany({ where: { email: testUser.email } });
  });

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const res = await app.request("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testUser),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty("success", "User created");
    });

    it("should fail if email already exists", async () => {
      const res = await app.request("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testUser),
      });

      expect(res.status).toBe(401);
    });

    it("should fail with invalid data (short password)", async () => {
      const res = await app.request("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...testUser,
          email: "other@test.com",
          password: "123",
        }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    it("should login successfully and return a token", async () => {
      const res = await app.request("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("token");
      expect(res.headers["getSetCookie"]).toBeDefined();
    });

    it("should fail with wrong password", async () => {
      const res = await app.request("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testUser.email,
          password: "WrongPassword123!",
        }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /auth/refresh", () => {
    let cookie: string;

    it("should refresh token using cookie", async () => {
      const loginRes = await app.request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      cookie = loginRes.headers.get("set-cookie") || "";
      expect(cookie).toContain("refreshToken=");

      const res = await app.request("/auth/refresh", {
        method: "GET",
        headers: { Cookie: cookie },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("token");
    });

    it("should fail if no refresh token cookie", async () => {
      const res = await app.request("/auth/refresh", {
        method: "GET",
      });
      expect(res.status).toBe(401);
    });
  });
});
