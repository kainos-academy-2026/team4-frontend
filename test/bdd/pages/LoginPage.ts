import assert from "node:assert/strict";
import type { Page } from "@playwright/test";

export class LoginPage {
	constructor(private readonly page: Page) {}

	async goto(baseUrl: string): Promise<void> {
		await this.page.goto(`${baseUrl}/login`);
		await this.page.getByRole("heading", { name: "Log in" }).waitFor();
	}

	async submitLogin(email: string, password: string): Promise<void> {
		await this.page.getByLabel("Email").fill(email);
		await this.page.getByLabel("Password").fill(password);
		await this.page.getByRole("button", { name: "Log in" }).click();
	}

	async disableNativeValidation(): Promise<void> {
		await this.page
			.locator("[data-login-form]")
			.evaluate((form) => form.setAttribute("novalidate", "novalidate"));
	}

	async assertOnLoginPage(): Promise<void> {
		const currentPath = new URL(this.page.url()).pathname;
		assert.equal(currentPath, "/login");
		await this.page.getByRole("heading", { name: "Log in" }).waitFor();
	}

	async assertLoginErrorEquals(expected: string): Promise<void> {
		const loginError = this.page.locator("[data-login-error]");
		await loginError.waitFor({ state: "visible" });
		const actual = (await loginError.textContent())?.trim();
		assert.equal(actual, expected);
	}

	async assertLoginErrorHidden(): Promise<void> {
		const isHidden = await this.page
			.locator("[data-login-error]")
			.evaluate((element) => (element as HTMLParagraphElement).hidden);
		assert.equal(isHidden, true);
	}

	async assertRedirectedToHomePage(): Promise<void> {
		await this.page.waitForURL("**/");
		const currentPath = new URL(this.page.url()).pathname;
		assert.equal(currentPath, "/");
		await this.page
			.getByRole("heading", { name: "Welcome to Kainos Careers" })
			.waitFor();
	}

	async assertAuthenticatedHeaderVisible(): Promise<void> {
		await this.page.getByRole("button", { name: "Log out" }).waitFor();
	}

	async clickHeaderRegisterLink(): Promise<void> {
		const header = this.page.locator("header");
		await header.getByRole("link", { name: "Register" }).click();
	}

	async clickFooterRegisterLink(): Promise<void> {
		const footer = this.page.locator(".kainos-form-footer");
		await footer.getByRole("link", { name: "Register" }).click();
	}

	async assertRedirectedToRegisterPage(): Promise<void> {
		await this.page.waitForURL("**/register", { timeout: 4_000 });
		const currentPath = new URL(this.page.url()).pathname;
		assert.equal(currentPath, "/register");
		await this.page.getByRole("heading", { name: "Create account" }).waitFor();
	}
}
