import type { Response } from "express";
import { describe, expect, it, vi } from "vitest";

import {
	clearAccessTokenCookie,
	setAccessTokenCookie,
} from "../../src/utils/cookieHelpers";

describe("cookie helper utilities", () => {
	it("sets access_token cookie with expected options", () => {
		const cookie = vi.fn();

		setAccessTokenCookie({ cookie } as unknown as Response, "token-value");

		expect(cookie).toHaveBeenCalledWith("access_token", "token-value", {
			httpOnly: true,
			sameSite: "lax",
			maxAge: 60 * 60 * 1000,
		});
	});

	it("clears access_token cookie", () => {
		const clearCookie = vi.fn();

		clearAccessTokenCookie({ clearCookie } as unknown as Response);

		expect(clearCookie).toHaveBeenCalledWith("access_token");
	});
});
