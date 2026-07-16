import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { validateLoginUser } from "../../src/middleware/loginUserMiddleware";

describe("validateLoginUser", () => {
	it("passes a valid payload", () => {
		const request = {
			body: {
				email: "  j@kainos.com ",
				password: "Password01!",
			},
		} as Request;
		const response = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;
		const next = vi.fn() as unknown as NextFunction;

		validateLoginUser(request, response, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(request.body).toEqual({
			email: "j@kainos.com",
			password: "Password01!",
		});
	});

	it("rejects invalid payload", () => {
		const request = {
			body: {
				email: "invalid",
				password: "",
			},
		} as Request;
		const status = vi.fn().mockReturnThis();
		const json = vi.fn();
		const response = { status, json } as unknown as Response;
		const next = vi.fn() as unknown as NextFunction;

		validateLoginUser(request, response, next);

		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({ message: "Invalid login payload" });
		expect(next).not.toHaveBeenCalled();
	});

	it("rejects extra fields", () => {
		const request = {
			body: {
				email: "j@kainos.com",
				password: "Password01!",
				role: "admin",
			},
		} as Request;
		const status = vi.fn().mockReturnThis();
		const json = vi.fn();
		const response = { status, json } as unknown as Response;
		const next = vi.fn() as unknown as NextFunction;

		validateLoginUser(request, response, next);

		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({ message: "Invalid login payload" });
		expect(next).not.toHaveBeenCalled();
	});
});
