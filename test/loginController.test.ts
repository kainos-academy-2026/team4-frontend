import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { getLogin } from "../src/controllers/loginController";

describe("getLogin", () => {
	it("renders the login view", () => {
		const render = vi.fn();

		getLogin({} as Request, { render } as unknown as Response);

		expect(render).toHaveBeenCalledWith("login", {
			demoAuthEnabled: false,
		});
	});
});