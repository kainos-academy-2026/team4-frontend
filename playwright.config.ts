import { defineConfig, devices } from "@playwright/test";

const isLive = process.env.E2E_LIVE === "true";

export default defineConfig({
	testDir: "test/e2e/journeys",
	use: {
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		launchOptions: {
			slowMo: 0,
		},
		video: "on",
	},
	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
	],
	webServer: isLive
		? undefined
		: [
				{
					command: "tsx test/e2e/mockBackend.ts",
					url: "http://localhost:4000/job-roles",
					reuseExistingServer: true,
					timeout: 10_000,
				},
				{
					command: "tsx src/index.ts",
					url: "http://localhost:3000",
					reuseExistingServer: true,
					timeout: 15_000,
					env: { API_BASE_URL: "http://localhost:4000" },
				},
			],
});
