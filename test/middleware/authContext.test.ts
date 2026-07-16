import type { NextFunction, Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SignJWT } from "jose";
import { setAuthContext } from "../../src/middleware/authContext";

const SECRET = new TextEncoder().encode("test-secret-key");

describe("setAuthContext", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.resetModules();
	});

	it("stores auth state in res.locals", async () => {
		const next = vi.fn() as unknown as NextFunction;
		const token = await new SignJWT({ email: "test@example.com" })
			.setProtectedHeader({ alg: "HS256" })
			.sign(SECRET);
		const response = {
			locals: {},
		} as Response;

		setAuthContext(
			{
				cookies: {
					access_token: token,
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

		setAuthContext({ cookies: {} } as Request, response, next);

		expect(response.locals).toEqual({
			isAuthenticated: false,
			userEmail: null,
		});
		expect(next).toHaveBeenCalledOnce();
	});

	it("handles invalid JWT tokens without throwing", () => {
		const next = vi.fn() as unknown as NextFunction;
		const response = {
			locals: {},
		} as Response;

		setAuthContext(
			{
				cookies: {
					access_token: "not-a-valid-jwt",
				},
			} as Request,
			response,
			next,
		);

		expect(response.locals).toEqual({
			isAuthenticated: true,
			userEmail: null,
		});
		expect(next).toHaveBeenCalledOnce();
	});

	it("sets userEmail to null when decoded token email claim is not a string", async () => {
		const next = vi.fn() as unknown as NextFunction;
		const token = await new SignJWT({ email: 12345 })
			.setProtectedHeader({ alg: "HS256" })
			.sign(SECRET);
		const response = {
			locals: {},
		} as Response;

		setAuthContext(
			{
				cookies: {
					access_token: token,
				},
			} as Request,
			response,
			next,
		);

		expect(response.locals).toEqual({
			isAuthenticated: true,
			userEmail: null,
		});
		expect(next).toHaveBeenCalledOnce();
	});
});