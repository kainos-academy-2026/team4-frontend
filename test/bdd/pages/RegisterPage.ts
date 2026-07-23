import assert from "node:assert/strict";
import type { Page } from "@playwright/test";

export class RegisterPage {
	constructor(private readonly page: Page) {}

	async goto(baseUrl: string): Promise<void> {
		await this.page.goto(`${baseUrl}/register`);
		await this.page.getByRole("heading", { name: "Create account" }).waitFor();
	}

	async submitRegistration(email: string, password: string): Promise<void> {
		await this.page.getByLabel("Email").fill(email);
		await this.page.getByLabel("Password").fill(password);
		await this.page.getByRole("button", { name: "Create account" }).click();
	}

	async submitRegistrationTwiceQuickly(email: string, password: string): Promise<void> {
		await this.page.getByLabel("Email").fill(email);
		await this.page.getByLabel("Password").fill(password);
		const submitButton = this.page.getByRole("button", { name: "Create account" });
		await submitButton.dblclick();
	}

	async typePassword(password: string): Promise<void> {
		await this.page.getByLabel("Password").fill(password);
	}

	async assertStatusEquals(expected: string): Promise<void> {
		const status = this.page.locator("[data-register-status]");
		await status.waitFor({ state: "visible" });
		await this.page.waitForFunction(
			({ selector, expectedText }) => {
				const element = document.querySelector(selector);
				return element?.textContent?.trim() === expectedText;
			},
			{ selector: "[data-register-status]", expectedText: expected },
		);
		const actual = (await status.textContent())?.trim();
		assert.equal(actual, expected);
	}

	async assertStatusHidden(): Promise<void> {
		const hidden = await this.page
			.locator("[data-register-status]")
			.evaluate((element) => (element as HTMLParagraphElement).hidden);
		assert.equal(hidden, true);
	}

	async assertEmailErrorEquals(expected: string): Promise<void> {
		const emailError = this.page.locator("[data-register-email-error]");
		await emailError.waitFor({ state: "visible" });
		const actual = (await emailError.textContent())?.trim();
		assert.equal(actual, expected);
	}

	async assertEmailErrorHidden(): Promise<void> {
		const hidden = await this.page
			.locator("[data-register-email-error]")
			.evaluate((element) => (element as HTMLParagraphElement).hidden);
		assert.equal(hidden, true);
	}

	async assertOnRegisterPage(): Promise<void> {
		const currentPath = new URL(this.page.url()).pathname;
		assert.equal(currentPath, "/register");
	}

	async assertRedirectedToLoginPage(): Promise<void> {
		await this.page.waitForURL("**/login", { timeout: 4_000 });
		const currentPath = new URL(this.page.url()).pathname;
		assert.equal(currentPath, "/login");
		await this.page.getByRole("heading", { name: "Log in" }).waitFor();
	}

	async clickHeaderLoginLink(): Promise<void> {
		await this.page.getByRole("link", { name: "Log in" }).click();
	}

	async assertPasswordRequirementState(key: string, shouldBeMet: boolean): Promise<void> {
		const requirement = this.page.locator(`[data-requirement="${key}"]`);
		await requirement.waitFor({ state: "visible" });
		const isMet = await requirement.evaluate((element) =>
			(element as HTMLElement).classList.contains("is-met"),
		);
		assert.equal(isMet, shouldBeMet);
	}

	async assertSubmitButtonDisabled(): Promise<void> {
		const button = this.page.getByRole("button", { name: "Create account" });
		assert.equal(await button.isDisabled(), true);
	}

	async assertSubmitButtonEnabled(): Promise<void> {
		const button = this.page.getByRole("button", { name: "Create account" });
		assert.equal(await button.isDisabled(), false);
	}
}
