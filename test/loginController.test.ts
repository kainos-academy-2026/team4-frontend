import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { createDemoToken } from "../src/auth/session";
import { getLogin } from "../src/controllers/loginController";

describe("getLogin", () => {
	it("renders the login view", () => {
		const render = vi.fn();

		getLogin({} as Request, { render } as unknown as Response);

		expect(render).toHaveBeenCalledWith("login", {
			demoAuthEnabled: false,
		});
	});

	it("redirects authenticated users to home", () => {
		const redirect = vi.fn();

		getLogin(
			{
				headers: {
					cookie: `demoAuthToken=${createDemoToken("test@test.com", "applicant")}`,
				},
			} as unknown as Request,
			{ redirect } as unknown as Response,
		);

		expect(redirect).toHaveBeenCalledWith("/");
	});
});