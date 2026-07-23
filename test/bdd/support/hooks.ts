import { After, AfterAll, Before, BeforeAll, setDefaultTimeout } from "@cucumber/cucumber";
import { chromium, type Browser } from "@playwright/test";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { CustomWorld } from "./world";

setDefaultTimeout(30_000);

let browser: Browser;
let server: Server;
let baseUrl = "";

const isHeadedModeEnabled = (): boolean => {
	const featureFlagEnabled = process.env.TEST_FEATURE_BDD_HEADED === "true";
	const legacyFlagEnabled = process.env.HEADED === "true";
	return featureFlagEnabled || legacyFlagEnabled;
};

const isRealBackendRun = (): boolean => {
	if (process.env.TEST_BDD_USE_REAL_BACKEND === "true") {
		return true;
	}

	return process.argv.some((argument) => argument.includes("@real-backend"));
};

const getBackendApiBaseUrl = (): string => {
	const realBackendBaseUrl = process.env.TEST_REAL_BACKEND_API_BASE_URL?.trim();
	if (realBackendBaseUrl) {
		return realBackendBaseUrl;
	}

	return process.env.API_BASE_URL ?? "http://localhost:4000";
};

const assertBackendHealth = async (apiBaseUrl: string): Promise<void> => {
	const healthUrl = `${apiBaseUrl.replace(/\/$/, "")}/health`;

	try {
		const response = await fetch(healthUrl, {
			signal: AbortSignal.timeout(4_000),
		});

		if (response.ok) {
			return;
		}

		throw new Error(`Health check returned status ${response.status}`);
	} catch (error) {
		const reason = error instanceof Error ? error.message : "unknown error";
		throw new Error(
			`Real-backend BDD run requires a reachable backend. Failed health check at ${healthUrl}. ${reason}. Set TEST_REAL_BACKEND_API_BASE_URL to the live backend origin and retry.`,
		);
	}
};

BeforeAll(async () => {
	const backendApiBaseUrl = getBackendApiBaseUrl();
	process.env.API_BASE_URL = backendApiBaseUrl;
	process.env.NODE_ENV ||= "test";

	if (isRealBackendRun()) {
		await assertBackendHealth(backendApiBaseUrl);
	}

	const { default: app } = await import("../../../src/app");

	server = createServer(app);
	await new Promise<void>((resolve) => {
		server.listen(0, "127.0.0.1", () => resolve());
	});

	const address = server.address() as AddressInfo;
	baseUrl = `http://127.0.0.1:${address.port}`;

	const headed = isHeadedModeEnabled();
	browser = await chromium.launch({
		headless: !headed,
	});
});

AfterAll(async () => {
	if (browser) {
		await browser.close();
	}

	if (server) {
		await new Promise<void>((resolve, reject) => {
			server.close((error) => {
				if (error) {
					reject(error);
					return;
				}
				resolve();
			});
		});
	}
});

Before(async function (this: CustomWorld) {
	this.browser = browser;
	this.context = await browser.newContext();
	this.page = await this.context.newPage();
	this.baseUrl = baseUrl;

	this.page.on("pageerror", (error) => {
		console.error(`[register-bdd][pageerror] ${error.message}`);
	});
});

After(async function (this: CustomWorld) {
	if (this.page) {
		await this.page.unroute("**/auth/register").catch(() => undefined);
	}

	if (this.context) {
		await this.context.close().catch(() => undefined);
	}
});
