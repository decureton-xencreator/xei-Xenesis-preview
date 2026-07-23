import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const migrations = await readD1Migrations("./continuum/migrations");

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./continuum/wrangler.jsonc" },
      miniflare: { bindings: { TEST_D1_MIGRATIONS: migrations } },
    }),
  ],
  test: {
    include: ["continuum/test/**/*.test.ts"],
  },
});
