import { describe, expect, it } from "vitest";

import {
	createRegistrationPayload,
	isPasswordValid,
	passwordRequirements,
} from "../../../public/scripts/registration.shared.js";

describe("registration shared client helpers", () => {
	it("creates strict payload with only email and password", () => {
		const payload = createRegistrationPayload("  new.user@example.com ", "Password!");

		expect(payload).toEqual({
			email: "new.user@example.com",
			password: "Password!",
		});
		expect(Object.keys(payload)).toEqual(["email", "password"]);
	});

	it("reports a password as valid once every requirement is met", () => {
		expect(isPasswordValid("Password1!")).toBe(true);
		expect(isPasswordValid("password")).toBe(false);
	});

	it("exposes the individual requirement checks used to build the checklist", () => {
		expect(passwordRequirements.map((requirement) => requirement.key)).toEqual([
			"length",
			"uppercase",
			"lowercase",
			"special",
		]);

		const lengthRequirement = passwordRequirements.find(
			(requirement) => requirement.key === "length",
		);
		expect(lengthRequirement?.test("short")).toBe(false);
		expect(lengthRequirement?.test("longenough")).toBe(true);
	});
});
