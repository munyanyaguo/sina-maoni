import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseUrl, loadEnvFile } from "./env";
import * as schema from "./schema";

export type Database = ReturnType<typeof createDatabase>;

export function createDatabase(connectionString?: string) {
  loadEnvFile();
  const client = postgres(connectionString ?? getDatabaseUrl(), { max: 10 });
  return drizzle(client, { schema });
}

/** Single connection intended for one-shot scripts (migrations, seeds). */
export function createSingleConnection(connectionString?: string) {
  loadEnvFile();
  const client = postgres(connectionString ?? getDatabaseUrl(), { max: 1 });
  return { client, db: drizzle(client, { schema }) };
}
