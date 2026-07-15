import type { Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoginController } from "../src/controllers/loginController";
import { LoginServiceError } from "../src/services/loginServiceError";

describe("login controller", () => {
	const createController = (authenticate = vi.fn()) => {
		const loginService = {
			authenticate,
		} as never;

		return new LoginController(loginService);
	};

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("renders the login view", () => {
		const render = vi.fn();
		const controller = createController();

		controller.getLogin({} as Request, { render } as unknown as Response);

		expect(render).toHaveBeenCalledWith("login", {
			errorMessage: null,
		});
	});

	it("sets token cookie and redirects on successful login", async () => {
		const authenticate = vi.fn().mockResolvedValue("token-123");
		const controller = createController(authenticate);

		const cookie = vi.fn().mockReturnThis();
		const redirect = vi.fn();

		await controller.postLogin(
			{
				body: {
					email: "test@example.com",
					password: "Password123!",
				},
			} as Request,
			{
				locals: {},
				cookie,
				redirect,
			} as unknown as Response,
		);

		expect(authenticate).toHaveBeenCalledWith({
			email: "test@example.com",
			password: "Password123!",
		});
		expect(cookie).toHaveBeenCalledWith("access_token", "token-123", {
			httpOnly: true,
			sameSite: "lax",
			maxAge: 60 * 60 * 1000,
		});
		expect(redirect).toHaveBeenCalledWith("/");
	});

	it("renders validation error when request body has validation errors", async () => {
		const authenticate = vi.fn();
		const controller = createController(authenticate);

		const render = vi.fn();
		const status = vi.fn(() => ({ render }));

		await controller.postLogin(
			{
				body: {},
			} as Request,
			{
				locals: { errors: { message: "validation error" } },
				status,
			} as unknown as Response,
		);

		expect(status).toHaveBeenCalledWith(400);
		expect(render).toHaveBeenCalledWith("login", {
			errorMessage: "Please enter both your email and password.",
		});
		expect(authenticate).not.toHaveBeenCalled();
	});

	it("renders 401 error when backend returns invalid credentials", async () => {
		const authenticate = vi
			.fn()
			.mockRejectedValue(
				new LoginServiceError(
					401,
					"Invalid email or password. Please try again.",
				),
			);
		const controller = createController(authenticate);

		const render = vi.fn();
		const status = vi.fn(() => ({ render }));

		await controller.postLogin(
			{
				body: {
					email: "test@example.com",
					password: "wrong",
				},
			} as Request,
			{ locals: {}, status } as unknown as Response,
		);

		expect(status).toHaveBeenCalledWith(401);
		expect(render).toHaveBeenCalledWith("login", {
			errorMessage: "Login failed. Please try again.",
		});
	});

	it("renders a generic 500 error for unexpected service failures", async () => {
		const authenticate = vi.fn().mockRejectedValue(new Error("boom"));
		const controller = createController(authenticate);

		const render = vi.fn();
		const status = vi.fn(() => ({ render }));

		await controller.postLogin(
			{
				body: {
					email: "test@example.com",
					password: "Password123!",
				},
			} as Request,
			{ locals: {}, status } as unknown as Response,
		);

		expect(status).toHaveBeenCalledWith(401);
		expect(render).toHaveBeenCalledWith("login", {
			errorMessage: "Login failed. Please try again.",
		});
	});

	it("clears token cookie and redirects on logout", () => {
		const clearCookie = vi.fn().mockReturnThis();
		const redirect = vi.fn();
		const controller = createController();

		controller.postLogout(
			{} as Request,
			{ clearCookie, redirect } as unknown as Response,
		);

		expect(clearCookie).toHaveBeenCalledWith("access_token");
		expect(redirect).toHaveBeenCalledWith("/");
	});
});