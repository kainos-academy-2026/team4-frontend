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

BeforeAll(async () => {
	process.env.API_BASE_URL ||= "http://localhost:4000";
	process.env.NODE_ENV ||= "test";

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
