import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { SignJWT } from "jose";
import { authorize } from "../../src/middleware/authContext";
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
			.setSubject("user-cuid-1")
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
				id: "user-cuid-1",
				email: "test@example.com",
				role: "user",
			},
		});
		expect(next).toHaveBeenCalledOnce();
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
			.setSubject("user-cuid-2")
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