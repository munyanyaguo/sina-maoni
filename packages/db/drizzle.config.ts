import { defineConfig } from "drizzle-kit";

import { getDatabaseUrl, loadEnvFile } from "./src/env";

loadEnvFile();

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: getDatabaseUrl() },
  strict: true,
  verbose: true,
});
