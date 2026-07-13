import { Hono } from "hono";
import { serve } from "@hono/node-server";
const app = new Hono();
app.get("/", (c) => c.text("OK"));

// Start the server on port 3000
serve({ fetch: app.fetch, port: 3000 });
