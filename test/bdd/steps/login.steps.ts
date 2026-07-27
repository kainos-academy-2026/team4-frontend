import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Given, Then, When } from "@cucumber/cucumber";
import { LoginPage } from "../pages/LoginPage";
import { CustomWorld } from "../support/world";

Given("I am on the login page", async function (this: CustomWorld) {
	this.loginPage = new LoginPage(this.page);
	await this.loginPage.goto(this.baseUrl);
});

Given("I observe login POST requests", async function (this: CustomWorld) {
	await this.observeLoginPostRequests();
});

Given("the login endpoint responds with success redirect", async function (this: CustomWorld) {
	await this.setLoginPostMock({ type: "success-redirect" });
});

Given(
	"the login endpoint responds with invalid credentials message {string}",
	async function (this: CustomWorld, message: string) {
		await this.setLoginPostMock({
			type: "render-error",
			statusCode: 401,
			message,
		});
	},
);

Given(
	"the login endpoint responds with service unavailable message {string}",
	async function (this: CustomWorld, message: string) {
		await this.setLoginPostMock({
			type: "render-error",
			statusCode: 502,
			message,
		});
	},
);

Given(
	"the login endpoint first fails with invalid credentials then succeeds",
	async function (this: CustomWorld) {
		await this.setLoginPostSequenceMock([
			{
				type: "render-error",
				statusCode: 401,
				message: "Invalid email or password.",
			},
			{ type: "success-redirect" },
		]);
	},
);

Given("the login form bypasses native validation", async function (this: CustomWorld) {
	await this.loginPage.disableNativeValidation();
});

Given(
	"I have a real registered login user with password {string}",
	async function (this: CustomWorld, password: string) {
		this.generatedRegisterEmail = `login-${Date.now()}-${randomUUID()}@example.com`;
		const response = await this.page.request.post(`${this.baseUrl}/auth/register`, {
			data: {
				email: this.generatedRegisterEmail,
				password,
			},
		});

		assert.equal(response.status(), 201);
	},
);

When(
	"I submit login with email {string} and password {string}",
	async function (this: CustomWorld, email: string, password: string) {
		await this.loginPage.submitLogin(email, password);
	},
);

When(
	"I submit login with the generated email and password {string}",
	async function (this: CustomWorld, password: string) {
		assert.notEqual(this.generatedRegisterEmail, "");
		await this.loginPage.submitLogin(this.generatedRegisterEmail, password);
	},
);

When(
	"I retry login with email {string} and password {string}",
	async function (this: CustomWorld, email: string, password: string) {
		await this.loginPage.submitLogin(email, password);
	},
);

When("I click the login page header Register link", async function (this: CustomWorld) {
	await this.loginPage.clickHeaderRegisterLink();
});

When("I click the login page footer Register link", async function (this: CustomWorld) {
	await this.loginPage.clickFooterRegisterLink();
});

Then("I should stay on the login page", async function (this: CustomWorld) {
	await this.loginPage.assertOnLoginPage();
});

Then("I should see login error {string}", async function (this: CustomWorld, expected: string) {
	await this.loginPage.assertLoginErrorEquals(expected);
});

Then("I should see login error hidden", async function (this: CustomWorld) {
	await this.loginPage.assertLoginErrorHidden();
});

Then("I should be redirected to the home page", async function (this: CustomWorld) {
	await this.loginPage.assertRedirectedToHomePage();
});

Then("I should see authenticated header actions", async function (this: CustomWorld) {
	await this.loginPage.assertAuthenticatedHeaderVisible();
});

Then("I should be redirected to the register page", async function (this: CustomWorld) {
	await this.loginPage.assertRedirectedToRegisterPage();
});

Then("the login POST should be called {int} time", function (this: CustomWorld, expected: number) {
	assert.equal(this.loginPostCallCount, expected);
});

Then("the login POST should be called {int} times", function (this: CustomWorld, expected: number) {
	assert.equal(this.loginPostCallCount, expected);
});

Then(
	"the login request email should be {string}",
	function (this: CustomWorld, expectedEmail: string) {
		assert.equal(this.lastLoginPostBody?.email, expectedEmail);
	},
);

Then(
	"the login request password should be {string}",
	function (this: CustomWorld, expectedPassword: string) {
		assert.equal(this.lastLoginPostBody?.password, expectedPassword);
	},
);

Then(
	"the login request email should match the generated email",
	function (this: CustomWorld) {
		assert.notEqual(this.generatedRegisterEmail, "");
		assert.equal(this.lastLoginPostBody?.email, this.generatedRegisterEmail);
	},
);
