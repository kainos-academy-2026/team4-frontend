import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";
import { RegisterPage } from "../pages/RegisterPage";
import { CustomWorld } from "../support/world";

Given("I am on the register page", async function (this: CustomWorld) {
	this.registerPage = new RegisterPage(this.page);
	await this.registerPage.goto(this.baseUrl);
});

Given("the register API responds with success", async function (this: CustomWorld) {
	await this.setRegisterApiMock({
		type: "success",
		message: "Registration Successful, redirecting you to the login page",
	});
});

Given(
	"the register API responds with conflict message {string}",
	async function (this: CustomWorld, message: string) {
		await this.setRegisterApiMock({
			type: "conflict",
			message,
		});
	},
);

Given("the register API fails with a network error", async function (this: CustomWorld) {
	await this.setRegisterApiMock({ type: "network-error" });
});

Given(
	"the register API responds with success for subsequent requests",
	async function (this: CustomWorld) {
		await this.setRegisterApiMock(
			{
				type: "success",
				message: "Registration Successful, redirecting you to the login page",
			},
			{ resetCallCount: false },
		);
	},
);

Given(
	"the register API responds with success after {int} milliseconds",
	async function (this: CustomWorld, delayMs: number) {
		await this.setRegisterApiMock({
			type: "success",
			message: "Registration Successful, redirecting you to the login page",
			delayMs,
		});
	},
);

When(
	"I submit registration with email {string} and password {string}",
	async function (this: CustomWorld, email: string, password: string) {
		await this.registerPage.submitRegistration(email, password);
	},
);

When("I type password {string}", async function (this: CustomWorld, password: string) {
	await this.registerPage.typePassword(password);
});

Then("I should see register status {string}", async function (this: CustomWorld, expected: string) {
	await this.registerPage.assertStatusEquals(expected);
});

Then("I should see register status hidden", async function (this: CustomWorld) {
	await this.registerPage.assertStatusHidden();
});

Then("I should see email error {string}", async function (this: CustomWorld, expected: string) {
	await this.registerPage.assertEmailErrorEquals(expected);
});

Then("I should be redirected to the login page", async function (this: CustomWorld) {
	await this.registerPage.assertRedirectedToLoginPage();
});

Then("I should stay on the register page", async function (this: CustomWorld) {
	await this.registerPage.assertOnRegisterPage();
});

Then("the register API should be called {int} time", function (this: CustomWorld, expected: number) {
	assert.equal(this.registerApiCallCount, expected);
});

Then("the register API should be called {int} times", function (this: CustomWorld, expected: number) {
	assert.equal(this.registerApiCallCount, expected);
});

Then(
	"password requirement {string} should be met",
	async function (this: CustomWorld, key: string) {
		await this.registerPage.assertPasswordRequirementState(key, true);
	},
);

Then(
	"password requirement {string} should be unmet",
	async function (this: CustomWorld, key: string) {
		await this.registerPage.assertPasswordRequirementState(key, false);
	},
);

Then("the register submit button should be disabled", async function (this: CustomWorld) {
	await this.registerPage.assertSubmitButtonDisabled();
});

Then("the register submit button should be enabled", async function (this: CustomWorld) {
	await this.registerPage.assertSubmitButtonEnabled();
});

Then(
	"the register request email should be {string}",
	function (this: CustomWorld, expectedEmail: string) {
		assert.equal(this.lastRegisterRequestBody?.email, expectedEmail);
	},
);
