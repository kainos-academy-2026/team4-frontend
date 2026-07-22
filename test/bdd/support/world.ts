import { setWorldConstructor, World } from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page } from "@playwright/test";
import { RegisterPage } from "../pages/RegisterPage";

type RegisterApiMode =
	| { type: "success"; message: string; delayMs?: number }
	| { type: "conflict"; message: string; delayMs?: number }
	| { type: "network-error" };

export class CustomWorld extends World {
	public browser!: Browser;
	public context!: BrowserContext;
	public page!: Page;
	public baseUrl = "";
	public registerPage!: RegisterPage;
	public registerApiCallCount = 0;
	public lastRegisterRequestBody: Record<string, unknown> | null = null;

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

			if (mode.type === "network-error") {
				await route.abort("failed");
				return;
			}

			if (mode.delayMs && mode.delayMs > 0) {
				await new Promise((resolve) => setTimeout(resolve, mode.delayMs));
			}

			const status = mode.type === "success" ? 201 : 409;
			await route.fulfill({
				status,
				contentType: "application/json",
				body: JSON.stringify({ message: mode.message }),
			});
		});
	}
}

setWorldConstructor(CustomWorld);
