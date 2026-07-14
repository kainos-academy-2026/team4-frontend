import { describe, expect, it, vi } from "vitest";

import {
	LoginService,
	LoginServiceError,
} from "../../src/services/loginService";

describe("LoginService", () => {
	it("returns an access token when authentication succeeds", async () => {
		const fetchFn = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: vi.fn().mockResolvedValue({ accessToken: "token-123" }),
		});
		const service = new LoginService("http://example.com", fetchFn as never);

		await expect(
			service.authenticate({
				email: "test@example.com",
				password: "Password123!",
			}),
		).resolves.toBe("token-123");
	});

	it("throws a 401 error for invalid credentials", async () => {
		const fetchFn = vi.fn().mockResolvedValue({
			ok: false,
			status: 401,
		});
		const service = new LoginService("http://example.com", fetchFn as never);

		await expect(
			service.authenticate({
				email: "test@example.com",
				password: "wrong",
			}),
		).rejects.toEqual(
			new LoginServiceError(
				401,
				"Invalid email or password. Please try again.",
			),
		);
	});

	it("throws a generic 500 error for unexpected backend responses", async () => {
		const fetchFn = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: vi.fn().mockResolvedValue({ accessToken: "" }),
		});
		const service = new LoginService("http://example.com", fetchFn as never);

		await expect(
			service.authenticate({
				email: "test@example.com",
				password: "Password123!",
			}),
		).rejects.toMatchObject({
			statusCode: 500,
			message: "Something went wrong. Please try again.",
		});
	});
});