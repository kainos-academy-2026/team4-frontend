import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    env: {
      API_BASE_URL: "http://localhost:4000",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary"],
      exclude: [
        // V8 cannot instrument simple single-expression re-export files
        "src/middleware/cookieParser.ts",
      ],
    },
  },
});