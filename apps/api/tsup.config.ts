import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  target: "node22",
  platform: "node",
  clean: true,
  sourcemap: true,
  // Workspace packages ship TypeScript source, so they must be bundled in.
  noExternal: [/^@sina-maoni\//],
});
