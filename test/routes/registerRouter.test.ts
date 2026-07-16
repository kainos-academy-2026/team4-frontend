import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import app from "../../src/app";
import { RegisterService } from "../../src/services/registerService";
import { RegisterServiceError } from "../../src/services/registerServiceError";

describe("GET /register", () => {
	it("renders the registration page", async () => {
		const response = await request(app).get("/register");

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toContain("text/html");
		expect(response.text).toContain("Create account");
		expect(response.text).toContain("data-register-form");
		expect(response.text).toContain('href="/login">Log in</a>');
	});
});

describe("POST /auth/register", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns 201 when backend registration succeeds", async () => {
		vi.spyOn(RegisterService.prototype, "register").mockResolvedValue({
			id: "new-id",
			email: "new.user@example.com",
			role: "user",
		});

		const response = await request(app).post("/auth/register").send({
			email: "new.user@example.com",
			password: "Password!",
		});

		expect(response.status).toBe(201);
		expect(response.body).toEqual({
			id: "new-id",
			email: "new.user@example.com",
			role: "user",
			variant: "success",
			message: "Registration Successful, redirecting you to the login page",
		});
	});

	it("returns 400 for invalid payload", async () => {
		const response = await request(app).post("/auth/register").send({
			email: "invalid-email",
			password: "password",
		});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({ message: "Invalid registration payload" });
	});

	it("rejects payload containing role field", async () => {
		const registerSpy = vi.spyOn(RegisterService.prototype, "register");

		const response = await request(app).post("/auth/register").send({
			email: "new.user@example.com",
			password: "Password!",
			role: "admin",
		});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({ message: "Invalid registration payload" });
		expect(registerSpy).not.toHaveBeenCalled();
	});

	it("returns 409 when backend indicates duplicate user", async () => {
		vi.spyOn(RegisterService.prototype, "register").mockRejectedValue(
			new RegisterServiceError(409, "User already exists"),
		);

		const response = await request(app).post("/auth/register").send({
			email: "existing.user@example.com",
			password: "Password!",
		});

		expect(response.status).toBe(409);
		expect(response.body).toEqual({
			message:
				"That email is already registered. Try logging in or use a different email.",
			variant: "error",
		});
	});

	it("returns 500 for unexpected backend failures", async () => {
		vi.spyOn(RegisterService.prototype, "register").mockRejectedValue(
			new RegisterServiceError(500, "Internal server error"),
		);

		const response = await request(app).post("/auth/register").send({
			email: "new.user@example.com",
			password: "Password!",
		});

		expect(response.status).toBe(500);
		expect(response.body).toEqual({
			variant: "error",
			message: "Something went wrong on our side. Please try again in a moment.",
		});
	});
});
