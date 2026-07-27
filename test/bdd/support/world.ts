import { setWorldConstructor, World } from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

type RegisterApiMode =
	| { type: "success"; message: string; delayMs?: number }
	| { type: "success-no-message"; delayMs?: number }
	| { type: "conflict"; message: string; delayMs?: number }
	| { type: "conflict-no-message"; delayMs?: number }
	| { type: "error-no-message"; delayMs?: number }
	| { type: "invalid-json"; delayMs?: number }
	| { type: "network-error" };

type LoginPostMode =
	| { type: "success-redirect"; delayMs?: number }
	| {
			type: "render-error";
			statusCode: number;
			message: string;
			delayMs?: number;
	  }
	| { type: "network-error" };

const buildMockLoginHtml = (errorMessage: string | null): string => {
	const errorBlock = errorMessage
		? `<p class="kainos-form-error" data-login-error aria-live="polite">${errorMessage}</p>`
		: '<p class="kainos-form-error" data-login-error aria-live="polite" hidden></p>';

	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Kainos | Log In</title>
	</head>
	<body class="kainos-page" data-page="login">
		<header class="kainos-header kainos-header--with-actions" aria-label="Kainos brand banner">
			<nav class="kainos-header-actions" aria-label="Authentication actions">
				<a class="kainos-header-link kainos-header-button" href="/register">Register</a>
			</nav>
		</header>
		<main class="kainos-hero" aria-label="Log in">
			<form class="kainos-auth-card" data-login-form method="post" action="/login">
				<h1 class="kainos-auth-title">Log in</h1>
				<label class="kainos-field">
					<span>Email</span>
					<input type="email" name="email" autocomplete="email" required />
				</label>
				<label class="kainos-field">
					<span>Password</span>
					<input type="password" name="password" autocomplete="current-password" required />
				</label>
				${errorBlock}
				<button class="kainos-primary-action" type="submit">Log in</button>
				<p class="kainos-form-footer">
					Don't have an account? <a href="/register">Register</a>
				</p>
			</form>
		</main>
	</body>
</html>`;
};

export class CustomWorld extends World {
	public browser!: Browser;
	public context!: BrowserContext;
	public page!: Page;
	public baseUrl = "";
	public generatedRegisterEmail = "";
	public registerPage!: RegisterPage;
	public loginPage!: LoginPage;
	public registerApiCallCount = 0;
	public lastRegisterRequestBody: Record<string, unknown> | null = null;
	public loginPostCallCount = 0;
	public lastLoginPostBody: Record<string, string> | null = null;

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

	private trackLoginPostRequest(route: {
		request: () => { postData: () => string | null };
	}): void {
		this.loginPostCallCount += 1;

		try {
			const rawBody = route.request().postData();
			if (!rawBody) {
				this.lastLoginPostBody = null;
				return;
			}

			const formData = new URLSearchParams(rawBody);
			const parsedBody: Record<string, string> = {};
			for (const [key, value] of formData.entries()) {
				parsedBody[key] = value;
			}

			this.lastLoginPostBody = Object.keys(parsedBody).length > 0 ? parsedBody : null;
		} catch {
			this.lastLoginPostBody = null;
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

	async setLoginPostMock(
		mode: LoginPostMode,
		options: { resetCallCount?: boolean } = {},
	): Promise<void> {
		const shouldReset = options.resetCallCount !== false;
		if (shouldReset) {
			this.loginPostCallCount = 0;
			this.lastLoginPostBody = null;
		}

		await this.page.unroute("**/login").catch(() => undefined);

		await this.page.route("**/login", async (route) => {
			if (route.request().method() !== "POST") {
				await route.continue();
				return;
			}

			this.trackLoginPostRequest(route);

			if (mode.type === "network-error") {
				await route.abort("failed");
				return;
			}

			if (mode.delayMs && mode.delayMs > 0) {
				await new Promise((resolve) => setTimeout(resolve, mode.delayMs));
			}

			if (mode.type === "success-redirect") {
				await route.fulfill({
					status: 302,
					headers: {
						location: "/",
						"set-cookie": "access_token=fake-token; Path=/; HttpOnly; SameSite=Lax",
					},
					body: "",
				});
				return;
			}

			await route.fulfill({
				status: mode.statusCode,
				contentType: "text/html",
				body: buildMockLoginHtml(mode.message),
			});
		});
	}

	async setLoginPostSequenceMock(modes: LoginPostMode[]): Promise<void> {
		this.loginPostCallCount = 0;
		this.lastLoginPostBody = null;

		let index = 0;
		await this.page.unroute("**/login").catch(() => undefined);

		await this.page.route("**/login", async (route) => {
			if (route.request().method() !== "POST") {
				await route.continue();
				return;
			}

			this.trackLoginPostRequest(route);
			const mode = modes[Math.min(index, modes.length - 1)];
			index += 1;

			if (mode.type === "network-error") {
				await route.abort("failed");
				return;
			}

			if (mode.delayMs && mode.delayMs > 0) {
				await new Promise((resolve) => setTimeout(resolve, mode.delayMs));
			}

			if (mode.type === "success-redirect") {
				await route.fulfill({
					status: 302,
					headers: {
						location: "/",
						"set-cookie": "access_token=fake-token; Path=/; HttpOnly; SameSite=Lax",
					},
					body: "",
				});
				return;
			}

			await route.fulfill({
				status: mode.statusCode,
				contentType: "text/html",
				body: buildMockLoginHtml(mode.message),
			});
		});
	}

	async observeLoginPostRequests(
		options: { resetCallCount?: boolean } = {},
	): Promise<void> {
		const shouldReset = options.resetCallCount !== false;
		if (shouldReset) {
			this.loginPostCallCount = 0;
			this.lastLoginPostBody = null;
		}

		await this.page.unroute("**/login").catch(() => undefined);

		await this.page.route("**/login", async (route) => {
			if (route.request().method() !== "POST") {
				await route.continue();
				return;
			}

			this.trackLoginPostRequest(route);
			await route.continue();
		});
	}
}

setWorldConstructor(CustomWorld);
