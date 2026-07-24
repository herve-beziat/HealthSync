import { Given, When, Then, BeforeAll } from "@cucumber/cucumber";
import app from "../../../src/index.js";
import assert from "node:assert";
import { prisma } from "../../../src/utils/prisma.js";

let patient: any;
let response: Response;

BeforeAll(async () => {
  await prisma.users.deleteMany({ where: { email: { contains: "test.bdd@gmail.com" } } });
});

Given("j'ai les informations d'un nouveau patient", async () => {
  patient = {
    email: "test.bdd@gmail.com",
    firstname: "test",
    lastname: "bdd",
    password: "passwordSecure123!",
    phone: "0491101045",
    date_of_birth: "1990-01-01",
    role: "patient",
  };
});

When("j'envoie une requête POST vers {string} avec ces informations", async (endpoint: string) => {
  response = await app.request(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patient),
  });
});

When(
  "j'envoie une requête POST vers {string} avec les mêmes informations",
  async (endpoint: string) => {
    response = await app.request(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: patient.email,
        password: patient.password,
      }),
    });
  },
);

Then("la réponse doit retourner un code de statut {int} OK", async (statusCode: number) => {
  if (response.status !== statusCode) {
    console.error("Erreur de statut. Réponse serveur:", await response.json());
  }
  assert.strictEqual(response.status, statusCode);
});

Then("le corps de la réponse doit contenir un jeton JWT valide", async () => {
  const responseBody = await response.json();
  assert.ok(responseBody.token, "Le corps de la réponse ne contient pas de jeton JWT");
});
