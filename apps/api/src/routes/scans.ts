import { createScanRequestSchema } from "@sina-maoni/core";
import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";

export async function registerScanRoutes(app: FastifyInstance): Promise<void> {
  app.post("/scans", { schema: { description: "Queue an accessibility scan" } }, async (request, reply) => {
    const parsed = createScanRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "ValidationError",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }

    // Persistence and worker dispatch land in Phase 1; the contract is fixed now.
    return reply.status(202).send({
      scanId: randomUUID(),
      status: "queued",
      request: parsed.data,
    });
  });
}
