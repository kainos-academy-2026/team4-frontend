import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { LoginRequestSchema } from "../../src/dto/loginDto";
import { validateBody } from "../../src/middleware/loginValidation";

describe("validateBody", () => {
	it("stores validation errors in res.locals.errors", () => {
		const next = vi.fn() as NextFunction;
		const response = { locals: {} } as Response;
		const middleware = validateBody(LoginRequestSchema);

		middleware(
			{ body: {} } as Request,
			response,
			next,
		);

		expect(response.locals.errors).toBeDefined();
		expect(next).toHaveBeenCalledOnce();
	});

	it("passes valid data through and calls next", () => {
		const next = vi.fn() as NextFunction;
		const request = {
			body: {
				email: "test@example.com",
				password: "Password123!",
			},
		} as Request;
		const middleware = validateBody(LoginRequestSchema);

		middleware(request, { locals: {} } as Response, next);

		expect(request.body).toEqual({
			email: "test@example.com",
			password: "Password123!",
		});
		expect(next).toHaveBeenCalledOnce();
	});
});