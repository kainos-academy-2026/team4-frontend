import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import app from "../../src/app";
import { LoginService } from "../../src/services/loginService";

describe("POST /login", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("redirects to home on successful form login", async () => {
		vi.spyOn(LoginService.prototype, "authenticate").mockResolvedValue(
			"jwt-token",
		);

		const response = await request(app)
			.post("/login")
			.type("form")
			.send({
				email: "j@kainos.com",
				password: "Password01!",
			});

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/");
	});

	it("renders login page on unexpected authentication failure", async () => {
		vi.spyOn(LoginService.prototype, "authenticate").mockRejectedValue(
			new Error("Invalid credentials"),
		);

		const response = await request(app)
			.post("/login")
			.type("form")
			.send({
				email: "j@kainos.com",
				password: "WrongPassword",
			});

		expect(response.status).toBe(502);
		expect(response.text).toContain(
			"Login service unavailable. Please try again later.",
		);
	});
});
