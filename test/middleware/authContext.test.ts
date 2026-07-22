import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { SignJWT } from "jose";
import { authorize, setAuthContext } from "../../src/middleware/authContext";
import { Role } from "../../src/models/role";

const SECRET = new TextEncoder().encode("test-secret-key");

describe("authorize", () => {
	it("stores user in res.locals and calls next for allowed role", async () => {
		const next = vi.fn() as unknown as NextFunction;
		const token = await new SignJWT({
			email: "test@example.com",
			role: "user",
		})
			.setProtectedHeader({ alg: "HS256" })
			.setSubject("1")
			.sign(SECRET);
		const response = {
			locals: {},
			redirect: vi.fn(),
			status: vi.fn(() => ({ render: vi.fn() })),
		} as unknown as Response;
		const middleware = authorize([Role.User, Role.Admin]);

		await middleware(
			{
				cookies: {
					access_token: token,
				},
			} as unknown as Request,
			response,
			next,
		);

		expect(response.locals).toEqual({
			user: {
				id: "1",
				email: "test@example.com",
				role: "user",
			},
		});
		expect(next).toHaveBeenCalledOnce();
	});

	it("clears the cookie and redirects to login when the token is invalid", async () => {
		const next = vi.fn() as unknown as NextFunction;
		const redirect = vi.fn();
		const clearCookie = vi.fn();
		const response = {
			locals: {},
			redirect,
			clearCookie,
			status: vi.fn(() => ({ render: vi.fn() })),
		} as unknown as Response;
		const middleware = authorize([Role.User, Role.Admin]);

		await middleware(
			{ cookies: { access_token: "not.a.valid.jwt" } } as unknown as Request,
			response,
			next,
		);

		expect(clearCookie).toHaveBeenCalledWith("access_token");
		expect(redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
	});

	it("redirects to login when token is missing", async () => {
		const next = vi.fn() as unknown as NextFunction;
		const redirect = vi.fn();
		const response = {
			locals: {},
			redirect,
			status: vi.fn(() => ({ render: vi.fn() })),
		} as unknown as Response;
		const middleware = authorize([Role.User, Role.Admin]);

		await middleware({ cookies: {} } as unknown as Request, response, next);

		expect(redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
	});

	it("renders forbidden when role is not allowed", async () => {
		const next = vi.fn() as unknown as NextFunction;
		const render = vi.fn();
		const status = vi.fn(() => ({ render }));
		const token = await new SignJWT({
			email: "test@example.com",
			role: "admin",
		})
			.setProtectedHeader({ alg: "HS256" })
			.setSubject("1")
			.sign(SECRET);
		const response = {
			locals: {},
			redirect: vi.fn(),
			status,
		} as unknown as Response;
		const middleware = authorize([Role.User]);

		await middleware(
			{
				cookies: {
					access_token: token,
				},
			} as unknown as Request,
			response,
			next,
		);

		expect(status).toHaveBeenCalledWith(403);
		expect(render).toHaveBeenCalledWith("not-found", {
			title: "Forbidden",
			message: "You do not have access to this page.",
		});
		expect(next).not.toHaveBeenCalled();
	});
});

describe("setAuthContext", () => {
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

	it("handles malformed JWT tokens gracefully", () => {
		const next = vi.fn() as unknown as NextFunction;
		const response = { locals: {} } as Response;

		setAuthContext(
			{ cookies: { access_token: "not.a.valid.jwt" } } as Request,
			response,
			next,
		);

		expect(response.locals).toEqual({
			isAuthenticated: true,
			userEmail: null,
		});
		expect(next).toHaveBeenCalledOnce();
	});

	it("sets email to null when JWT payload has no string email claim", async () => {
		const token = await new SignJWT({ role: "admin" })
			.setProtectedHeader({ alg: "HS256" })
			.sign(SECRET);

		const next = vi.fn() as unknown as NextFunction;
		const response = { locals: {} } as Response;

		setAuthContext(
			{ cookies: { access_token: token } } as Request,
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
