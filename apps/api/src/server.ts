import { loadEnvFile } from "@sina-maoni/db";

import { buildApp } from "./app";
import { loadEnv } from "./env";

async function start(): Promise<void> {
  loadEnvFile();
  const env = loadEnv();
  const app = await buildApp(env);

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      void app.close().then(() => process.exit(0));
    });
  }

  await app.listen({ host: env.API_HOST, port: env.API_PORT });
}

start().catch((error: unknown) => {
  process.exitCode = 1;
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
});
