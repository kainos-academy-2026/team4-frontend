import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import app from "../../src/app";
import { AuthService } from "../../src/services/authService";

describe("POST /api/login", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns 400 when email or password are missing", async () => {
		const response = await request(app).post("/api/login").send({ email: "test@test.com" });

		expect(response.status).toBe(400);
		expect(response.body).toEqual({ message: "Email and password are required." });
	});

	it("returns access token and sets access_token cookie when credentials are valid", async () => {
		vi.spyOn(AuthService.prototype, "login").mockResolvedValue({
			accessToken: "header.payload.signature",
		});

		const response = await request(app).post("/api/login").send({
			email: "test@test.com",
			password: "passwordtest",
		});

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ accessToken: "header.payload.signature" });
		expect(response.headers["set-cookie"]).toEqual(
			expect.arrayContaining([expect.stringContaining("access_token=")]),
		);
	});

	it("returns 401 when backend rejects credentials", async () => {
		vi.spyOn(AuthService.prototype, "login").mockRejectedValue({
			isAxiosError: true,
			response: { status: 401 },
		});

		const response = await request(app).post("/api/login").send({
			email: "test@test.com",
			password: "wrong-password",
		});

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Invalid email or password." });
	});

	it("returns 502 when backend login service is unavailable", async () => {
		vi.spyOn(AuthService.prototype, "login").mockRejectedValue(
			new Error("service unavailable"),
		);

		const response = await request(app).post("/api/login").send({
			email: "test@test.com",
			password: "passwordtest",
		});

		expect(response.status).toBe(502);
		expect(response.body).toEqual({ message: "Login service unavailable." });
	});
});
