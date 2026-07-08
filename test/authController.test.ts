import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import {
	getLogin,
	getLogout,
	postLogin,
} from "../src/controllers/authController";

describe("auth controller", () => {
	it("renders login for GET /login and redirects POST /login to home", () => {
		const render = vi.fn();
		const redirect = vi.fn();

		getLogin({} as Request, { render } as unknown as Response);
		postLogin({} as Request, { redirect } as unknown as Response);

		expect(render).toHaveBeenCalledTimes(1);
		expect(render).toHaveBeenCalledWith("login");
		expect(redirect).toHaveBeenCalledWith("/");
	});

	it("redirects logout requests to the login page", () => {
		const redirect = vi.fn();

		getLogout({} as Request, { redirect } as unknown as Response);

		expect(redirect).toHaveBeenCalledWith("/login");
	});
});