import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { validateLoginBody } from "../../src/middleware/loginValidation";

describe("validateLoginBody", () => {
	it("renders a login error when fields are missing", () => {
		const render = vi.fn();
		const status = vi.fn(() => ({ render }));

		validateLoginBody(
			{ body: {} } as Request,
			{ status } as unknown as Response,
			vi.fn() as NextFunction,
		);

		expect(status).toHaveBeenCalledWith(400);
		expect(render).toHaveBeenCalledWith("login", {
			errorMessage: "Please enter both your email and password.",
		});
	});

	it("passes valid login data through", () => {
		const next = vi.fn() as NextFunction;
		const request = {
			body: {
				email: "test@example.com",
				password: "Password123!",
			},
		} as Request;

		validateLoginBody(request, {} as Response, next);

		expect(request.body).toEqual({
			email: "test@example.com",
			password: "Password123!",
		});
		expect(next).toHaveBeenCalledOnce();
	});
});