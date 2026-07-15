import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { validateRegisterUser } from "../../src/middleware/registerUserMiddleware";

describe("validateRegisterUser", () => {
	it("passes valid payload and trims email", () => {
		const request = {
			body: {
				email: "  valid.user@example.com ",
				password: "Password!",
			},
		} as Request;
		const response = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;
		const next = vi.fn() as unknown as NextFunction;

		validateRegisterUser(request, response, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(request.body).toEqual({
			email: "valid.user@example.com",
			password: "Password!",
		});
	});

	it("rejects invalid email", () => {
		const request = {
			body: {
				email: "invalid-email",
				password: "Password!",
			},
		} as Request;
		const status = vi.fn().mockReturnThis();
		const json = vi.fn();
		const response = { status, json } as unknown as Response;
		const next = vi.fn() as unknown as NextFunction;

		validateRegisterUser(request, response, next);

		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({ message: "Invalid registration payload" });
		expect(next).not.toHaveBeenCalled();
	});

	it("rejects payload with extra fields", () => {
		const request = {
			body: {
				email: "valid.user@example.com",
				password: "Password!",
				role: "admin",
			},
		} as Request;
		const status = vi.fn().mockReturnThis();
		const json = vi.fn();
		const response = { status, json } as unknown as Response;
		const next = vi.fn() as unknown as NextFunction;

		validateRegisterUser(request, response, next);

		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({ message: "Invalid registration payload" });
		expect(next).not.toHaveBeenCalled();
	});

	it("rejects password without required complexity", () => {
		const request = {
			body: {
				email: "valid.user@example.com",
				password: "password",
			},
		} as Request;
		const status = vi.fn().mockReturnThis();
		const json = vi.fn();
		const response = { status, json } as unknown as Response;
		const next = vi.fn() as unknown as NextFunction;

		validateRegisterUser(request, response, next);

		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({ message: "Invalid registration payload" });
		expect(next).not.toHaveBeenCalled();
	});
});
