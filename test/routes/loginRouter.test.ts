import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import app from "../../src/app";
import { LoginService } from "../../src/services/loginService";
import { LoginServiceError } from "../../src/services/loginServiceError";

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
		expect(response.headers["set-cookie"]?.join(";")).toContain("access_token=");
	});

	it("returns 400 for invalid payload", async () => {
		const authSpy = vi.spyOn(LoginService.prototype, "authenticate");

		const response = await request(app)
			.post("/login")
			.type("form")
			.send({
				email: "invalid",
				password: "",
			});

		expect(response.status).toBe(400);
		expect(response.text).toContain("Please enter both your email and password.");
		expect(authSpy).not.toHaveBeenCalled();
	});

	it("returns 401 for invalid credentials", async () => {
		vi.spyOn(LoginService.prototype, "authenticate").mockRejectedValue(
			new LoginServiceError(401, "Invalid email or password"),
		);

		const response = await request(app)
			.post("/login")
			.type("form")
			.send({
				email: "j@kainos.com",
				password: "WrongPassword01!",
			});

		expect(response.status).toBe(401);
		expect(response.text).toContain("Login failed. Please try again.");
	});
});
