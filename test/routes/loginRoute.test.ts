import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import app from "../../src/app";
import { LoginService, LoginServiceError } from "../../src/services/loginService";

describe("POST /auth/login", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns 200 when backend login succeeds", async () => {
		vi.spyOn(LoginService.prototype, "login").mockResolvedValue({
			token: "jwt-token",
			email: "j@kainos.com",
		});

		const response = await request(app).post("/auth/login").send({
			email: "j@kainos.com",
			password: "Password01!",
		});

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			token: "jwt-token",
			email: "j@kainos.com",
		});
	});

	it("returns 400 for invalid payload", async () => {
		const loginSpy = vi.spyOn(LoginService.prototype, "login");

		const response = await request(app).post("/auth/login").send({
			email: "invalid",
			password: "",
		});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({ message: "Invalid login payload" });
		expect(loginSpy).not.toHaveBeenCalled();
	});

	it("returns 401 for invalid credentials", async () => {
		vi.spyOn(LoginService.prototype, "login").mockRejectedValue(
			new LoginServiceError(401, "Invalid email or password"),
		);

		const response = await request(app).post("/auth/login").send({
			email: "j@kainos.com",
			password: "WrongPassword01!",
		});

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Invalid email or password" });
	});
});
