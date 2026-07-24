import { setWorldConstructor, World } from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page } from "@playwright/test";
import { RegisterPage } from "../pages/RegisterPage";

type RegisterApiMode =
	| { type: "success"; message: string; delayMs?: number }
	| { type: "success-no-message"; delayMs?: number }
	| { type: "conflict"; message: string; delayMs?: number }
	| { type: "conflict-no-message"; delayMs?: number }
	| { type: "error-no-message"; delayMs?: number }
	| { type: "invalid-json"; delayMs?: number }
	| { type: "network-error" };

export class CustomWorld extends World {
	public browser!: Browser;
	public context!: BrowserContext;
	public page!: Page;
	public baseUrl = "";
	public generatedRegisterEmail = "";
	public registerPage!: RegisterPage;
	public registerApiCallCount = 0;
	public lastRegisterRequestBody: Record<string, unknown> | null = null;

	private trackRegisterRequest(route: {
		request: () => { postDataJSON: () => unknown };
	}): void {
		this.registerApiCallCount += 1;

		try {
			const requestBody = route.request().postDataJSON();
			if (requestBody && typeof requestBody === "object") {
				this.lastRegisterRequestBody = requestBody as Record<string, unknown>;
			} else {
				this.lastRegisterRequestBody = null;
			}
		} catch {
			this.lastRegisterRequestBody = null;
		}
	}

	async setRegisterApiMock(
		mode: RegisterApiMode,
		options: { resetCallCount?: boolean } = {},
	): Promise<void> {
		const shouldReset = options.resetCallCount !== false;
		if (shouldReset) {
			this.registerApiCallCount = 0;
			this.lastRegisterRequestBody = null;
		}

		await this.page.unroute("**/auth/register").catch(() => undefined);

		await this.page.route("**/auth/register", async (route) => {
			this.trackRegisterRequest(route);

			if (mode.type === "network-error") {
				await route.abort("failed");
				return;
			}

			if (mode.delayMs && mode.delayMs > 0) {
				await new Promise((resolve) => setTimeout(resolve, mode.delayMs));
			}

			if (mode.type === "invalid-json") {
				await route.fulfill({
					status: 201,
					contentType: "application/json",
					body: "not-json",
				});
				return;
			}

			if (mode.type === "success-no-message") {
				await route.fulfill({
					status: 201,
					contentType: "application/json",
					body: JSON.stringify({}),
				});
				return;
			}

			if (mode.type === "conflict-no-message") {
				await route.fulfill({
					status: 409,
					contentType: "application/json",
					body: JSON.stringify({}),
				});
				return;
			}

			if (mode.type === "error-no-message") {
				await route.fulfill({
					status: 500,
					contentType: "application/json",
					body: JSON.stringify({}),
				});
				return;
			}

			const status = mode.type === "success" ? 201 : 409;
			await route.fulfill({
				status,
				contentType: "application/json",
				body: JSON.stringify({ message: mode.message }),
			});
		});
	}

	async observeRegisterApiRequests(
		options: { resetCallCount?: boolean } = {},
	): Promise<void> {
		const shouldReset = options.resetCallCount !== false;
		if (shouldReset) {
			this.registerApiCallCount = 0;
			this.lastRegisterRequestBody = null;
		}

		await this.page.unroute("**/auth/register").catch(() => undefined);

		await this.page.route("**/auth/register", async (route) => {
			this.trackRegisterRequest(route);
			await route.continue();
		});
	}
}

setWorldConstructor(CustomWorld);
