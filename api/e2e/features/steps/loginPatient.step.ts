import { Given, When, Then } from "@cucumber/cucumber";
import app from "../../../src/index.js";
import assert from "node:assert";

let patient: any;
let response: Response;

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

When(
  "j'envoie une requête POST vers l'endpoint {string} avec ces informations",
  async (endpoint: string) => {
    response = await app.request(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patient),
    });
  },
);

Then("la réponse doit retourner un code de statut {int} Created", async (statusCode: number) => {
  assert.strictEqual(response.status, statusCode);
});

Then("le corps de la réponse doit contenir un jeton JWT valide", async () => {
  const data = await response.json();
  assert.ok(data.token, "Le token JWT est manquant dans la réponse");
  assert.notStrictEqual(data.token, "");
});
