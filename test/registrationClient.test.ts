import { describe, expect, it } from "vitest";

import {
	createRegistrationPayload,
	mapRegistrationStatusToMessage,
	validateRegistrationInput,
} from "../public/scripts/registration.shared.js";

describe("registration shared client helpers", () => {
	it("creates strict payload with only email and password", () => {
		const payload = createRegistrationPayload("  new.user@example.com ", "Password!");

		expect(payload).toEqual({
			email: "new.user@example.com",
			password: "Password!",
		});
		expect(Object.keys(payload)).toEqual(["email", "password"]);
	});

	it("returns valid for a compliant email and password", () => {
		const result = validateRegistrationInput("new.user@example.com", "Password!");

		expect(result).toEqual({
			emailError: "",
			passwordError: "",
			isValid: true,
		});
	});

	it("returns validation messages for invalid fields", () => {
		const result = validateRegistrationInput("invalid-email", "password");

		expect(result.isValid).toBe(false);
		expect(result.emailError).toContain("valid email");
		expect(result.passwordError).toContain("at least 8 characters");
	});

	it("maps backend response statuses to user-facing messages", () => {
		expect(mapRegistrationStatusToMessage(201)).toEqual({
			variant: "success",
			message:
				"Account created successfully. Continue to the login page to sign in with your new credentials.",
			cta: {
				label: "Go to login",
				href: "/login",
			},
		});

		expect(mapRegistrationStatusToMessage(400)).toEqual({
			variant: "error",
			message:
				"Your registration details are invalid. Check your email and password and try again.",
			cta: null,
		});

		expect(mapRegistrationStatusToMessage(409)).toEqual({
			variant: "error",
			message:
				"That email is already registered. Try logging in or use a different email.",
			cta: null,
		});

		expect(mapRegistrationStatusToMessage(500)).toEqual({
			variant: "error",
			message: "Something went wrong on our side. Please try again in a moment.",
			cta: null,
		});
	});
});
