import { describe, expect, it } from "vitest";

import { buildApp } from "./app";
import type { Env } from "./env";

const testEnv: Env = {
  NODE_ENV: "test",
  API_HOST: "127.0.0.1",
  API_PORT: 3001,
  CORS_ORIGIN: "http://localhost:3000",
  LOG_LEVEL: "error",
  JWT_SECRET: "test-secret-that-is-at-least-32-chars",
  DATABASE_URL: "postgresql://sina:sina@localhost:5432/sina_maoni",
};

describe("api", () => {
  it("reports healthy", async () => {
    const app = await buildApp(testEnv);
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: "ok" });
    await app.close();
  });

  it("rejects an invalid scan request", async () => {
    const app = await buildApp(testEnv);
    const response = await app.inject({
      method: "POST",
      url: "/v1/scans",
      payload: { projectId: "not-a-uuid", rootUrl: "nope" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("ValidationError");
    await app.close();
  });

  it("queues a valid scan request", async () => {
    const app = await buildApp(testEnv);
    const response = await app.inject({
      method: "POST",
      url: "/v1/scans",
      payload: {
        projectId: "3f4b2c9e-4d3a-4f2b-8c1e-2a9d6b7c5e40",
        rootUrl: "https://example.com",
      },
    });

    expect(response.statusCode).toBe(202);
    expect(response.json().status).toBe("queued");
    await app.close();
  });
});
