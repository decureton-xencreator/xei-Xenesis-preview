import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./continuum/wrangler.jsonc" },
    }),
  ],
  test: {
    include: ["continuum/test/**/*.test.ts"],
  },
});
