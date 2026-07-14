import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { setAuthContext } from "../../src/middleware/authContext";

describe("setAuthContext", () => {
	it("stores auth state in res.locals", () => {
		const next = vi.fn() as unknown as NextFunction;
		const jwtPayload = Buffer.from(
			JSON.stringify({ email: "test@example.com" }),
		).toString("base64url");
		const token = `header.${jwtPayload}.signature`;
		const response = {
			locals: {},
		} as Response;

		setAuthContext(
			{
				headers: {
					cookie: `access_token=${token}`,
				},
			} as Request,
			response,
			next,
		);

		expect(response.locals).toEqual({
			isAuthenticated: true,
			userEmail: "test@example.com",
		});
		expect(next).toHaveBeenCalledOnce();
	});

	it("marks unauthenticated requests with null email", () => {
		const next = vi.fn() as unknown as NextFunction;
		const response = {
			locals: {},
		} as Response;

		setAuthContext({ headers: {} } as Request, response, next);

		expect(response.locals).toEqual({
			isAuthenticated: false,
			userEmail: null,
		});
		expect(next).toHaveBeenCalledOnce();
	});
});