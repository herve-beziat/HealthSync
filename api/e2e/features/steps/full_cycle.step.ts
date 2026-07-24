import { Given, When, Then, BeforeAll } from "@cucumber/cucumber";
import assert from "node:assert";
import app from "../../../src/index.js";
import { prisma } from "../../../src/utils/prisma.js";
import argon2 from "argon2";

const context: any = {
  tokens: {},
  users: {},
  lastResponse: null,
  appointmentId: null,
};

// Nettoyage avant les tests
BeforeAll(async () => {
  await prisma.appointments.deleteMany({});
  await prisma.doctor_schedules.deleteMany({});
  await prisma.refresh_tokens.deleteMany({});
  // On ne supprime que les users créés par les tests E2E pour éviter de casser les autres tests
  await prisma.users.deleteMany({ where: { email: { contains: "e2e@example.com" } } });
});

Given("un nouveau patient {string} avec l'email {string}", async function (name, email) {
  const password = "Password123!";
  const user = await prisma.users.create({
    data: {
      firstname: name,
      lastname: "E2E",
      email: email,
      phone: "0600000000",
      date_of_birth: new Date("1990-01-01"),
      role: "patient",
      password_hash: await argon2.hash(password),
    },
  });
  context.users[name] = { id: user.id, email, password };
});

Given("un nouveau médecin {string} avec l'email {string}", async function (name, email) {
  const password = "Password123!";
  const user = await prisma.users.create({
    data: {
      firstname: name,
      lastname: "E2E",
      email: email,
      phone: "0600000001",
      date_of_birth: new Date("1980-01-01"),
      role: "medecin",
      password_hash: await argon2.hash(password),
    },
  });
  context.users[name] = { id: user.id, email, password };
});

Given("le médecin a un planning le lundi de {string} à {string}", async function (start, end) {
  const doctor = Object.values(context.users).find((u: any) =>
    u.email.includes("smith.e2e"),
  ) as any;
  await prisma.doctor_schedules.create({
    data: {
      doctor_id: doctor.id,
      day_of_week: 1, // Lundi
      start_time: new Date(`1970-01-01T${start}:00Z`),
      end_time: new Date(`1970-01-01T${end}:00Z`),
      slot_duration: 30,
    },
  });
});

When("le patient {string} se connecte", async function (name) {
  const user = context.users[name];
  const res = await app.request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: user.email, password: user.password }),
  });
  const body = await res.json();
  context.tokens[name] = body.token;
});

When(
  "le patient réserve un rendez-vous le {string} pour 30 minutes avec {string}",
  async function (startTime, doctorName) {
    const startAt = new Date(startTime);
    const endAt = new Date(startAt.getTime() + 30 * 60000);

    const patient = Object.values(context.users).find((u: any) =>
      u.email.includes("alice.e2e"),
    ) as any;
    const doctor = context.users[doctorName];
    const token = context.tokens["Alice"];

    const res = await app.request("/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        doctor_id: doctor.id,
        patient_id: patient.id,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
      }),
    });

    context.lastResponse = res;
    if (res.status === 201) {
      const body = await res.json();
      context.appointmentId = body.id;
    }
  },
);

Then("le rendez-vous est confirmé", async function () {
  assert.strictEqual(context.lastResponse.status, 201);
});

When("le patient tente de réserver le même créneau avec {string}", async function (doctorName) {
  const startTime = "2025-10-27T10:00:00Z"; // Même créneau que l'étape précédente
  const startAt = new Date(startTime);
  const endAt = new Date(startAt.getTime() + 30 * 60000);

  const patient = Object.values(context.users).find((u: any) =>
    u.email.includes("alice.e2e"),
  ) as any;
  const doctor = context.users[doctorName];
  const token = context.tokens["Alice"];

  const res = await app.request("/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      doctor_id: doctor.id,
      patient_id: patient.id,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
    }),
  });
  context.lastResponse = res;
});

Then("le système retourne une erreur de conflit", function () {
  assert.strictEqual(context.lastResponse.status, 409);
});

When("le patient annule son rendez-vous", async function () {
  const token = context.tokens["Alice"];
  const res = await app.request(`/appointments/${context.appointmentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  context.lastResponse = res;
});

Then("le rendez-vous est marqué comme supprimé ou annulé", async function () {
  assert.strictEqual(context.lastResponse.status, 200);

  const token = context.tokens["Alice"];
  const res = await app.request(`/appointments/${context.appointmentId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 200) {
    const body = await res.json();
    assert.notStrictEqual(body.status, "scheduled");
  } else {
    assert.strictEqual(res.status, 404);
  }
});
