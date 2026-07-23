import type { Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoginApiController } from "../../src/controllers/loginApiController";

describe("login api controller", () => {
	const createController = (login = vi.fn()) => {
		const authService = {
			login,
		} as never;

		return new LoginApiController(authService);
	};

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns 400 when validation errors exist", async () => {
		const login = vi.fn();
		const controller = createController(login);
		const json = vi.fn();
		const status = vi.fn(() => ({ json }));

		await controller.login(
			{ body: {} } as Request,
			{ locals: { errors: { message: "validation error" } }, status } as unknown as Response,
		);

		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({ message: "Email and password are required." });
		expect(login).not.toHaveBeenCalled();
	});

	it("sets token cookie and returns 200 payload on successful login", async () => {
		const login = vi.fn().mockResolvedValue({
			accessToken: "header.payload.signature",
		});
		const controller = createController(login);
		const cookie = vi.fn();
		const json = vi.fn();
		const status = vi.fn(() => ({ json }));

		await controller.login(
			{
				body: {
					email: "test@example.com",
					password: "Password123!",
				},
			} as Request,
			{ locals: {}, cookie, status } as unknown as Response,
		);

		expect(login).toHaveBeenCalledWith("test@example.com", "Password123!");
		expect(cookie).toHaveBeenCalledWith("access_token", "header.payload.signature", {
			httpOnly: true,
			sameSite: "lax",
			maxAge: 60 * 60 * 1000,
		});
		expect(status).toHaveBeenCalledWith(200);
		expect(json).toHaveBeenCalledWith({ accessToken: "header.payload.signature" });
	});

	it("returns 401 when login service rejects with unauthorized", async () => {
		const login = vi.fn().mockRejectedValue({
			response: { status: 401 },
		});
		const controller = createController(login);
		const json = vi.fn();
		const status = vi.fn(() => ({ json }));

		await controller.login(
			{
				body: {
					email: "test@example.com",
					password: "wrong-password",
				},
			} as Request,
			{ locals: {}, status } as unknown as Response,
		);

		expect(status).toHaveBeenCalledWith(401);
		expect(json).toHaveBeenCalledWith({ message: "Invalid email or password." });
	});

	it("returns 502 when login service throws unexpected error", async () => {
		const login = vi.fn().mockRejectedValue(new Error("unavailable"));
		const controller = createController(login);
		const json = vi.fn();
		const status = vi.fn(() => ({ json }));

		await controller.login(
			{
				body: {
					email: "test@example.com",
					password: "Password123!",
				},
			} as Request,
			{ locals: {}, status } as unknown as Response,
		);

		expect(status).toHaveBeenCalledWith(502);
		expect(json).toHaveBeenCalledWith({ message: "Login service unavailable." });
	});
});
