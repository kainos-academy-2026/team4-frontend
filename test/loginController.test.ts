import type { Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
	getLogin,
	postLogin,
	postLogout,
} from "../src/controllers/loginController";

describe("login controller", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("renders the login view", () => {
		const render = vi.fn();

		getLogin({} as Request, { render } as unknown as Response);

		expect(render).toHaveBeenCalledWith("login", {
			errorMessage: null,
		});
	});

	it("sets token cookie and redirects on successful login", async () => {
		const json = vi.fn().mockResolvedValue({ accessToken: "token-123" });
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				json,
			}),
		);

		const setHeader = vi.fn();
		const redirect = vi.fn();
		const status = vi.fn(() => ({ render: vi.fn() }));

		await postLogin(
			{
				body: {
					email: "test@example.com",
					password: "Password123!",
				},
			} as Request,
			{ setHeader, redirect, status } as unknown as Response,
		);

		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining("/auth/login"),
			expect.objectContaining({
				method: "POST",
			}),
		);
		expect(setHeader).toHaveBeenCalledWith(
			"Set-Cookie",
			expect.stringContaining("access_token=token-123"),
		);
		expect(redirect).toHaveBeenCalledWith("/");
		expect(status).not.toHaveBeenCalled();
	});

	it("renders 401 error when backend returns invalid credentials", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: false,
				status: 401,
			}),
		);

		const render = vi.fn();
		const status = vi.fn(() => ({ render }));

		await postLogin(
			{
				body: {
					email: "test@example.com",
					password: "wrong",
				},
			} as Request,
			{ status } as unknown as Response,
		);

		expect(status).toHaveBeenCalledWith(401);
		expect(render).toHaveBeenCalledWith("login", {
			errorMessage: "Invalid email or password. Please try again.",
		});
	});

	it("renders 400 error when form fields are missing", async () => {
		const render = vi.fn();
		const status = vi.fn(() => ({ render }));

		await postLogin(
			{
				body: {
					email: "",
					password: "",
				},
			} as Request,
			{ status } as unknown as Response,
		);

		expect(status).toHaveBeenCalledWith(400);
		expect(render).toHaveBeenCalledWith("login", {
			errorMessage: "Please enter both your email and password.",
		});
	});

	it("clears token cookie and redirects on logout", () => {
		const setHeader = vi.fn();
		const redirect = vi.fn();

		postLogout(
			{} as Request,
			{ setHeader, redirect } as unknown as Response,
		);

		expect(setHeader).toHaveBeenCalledWith(
			"Set-Cookie",
			expect.stringContaining("Max-Age=0"),
		);
		expect(redirect).toHaveBeenCalledWith("/");
	});
});