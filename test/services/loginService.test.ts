import { describe, expect, it, vi, beforeEach } from "vitest";

import apiClient from "../../src/config/apiClient";
import { LoginService } from "../../src/services/loginService";
import { LoginServiceError } from "../../src/services/loginServiceError";

vi.mock("../../src/config/apiClient");

describe("LoginService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns an access token when authentication succeeds", async () => {
		const mockPost = vi.fn().mockResolvedValue({
			data: { token: "token-123" },
		});
		vi.mocked(apiClient).post = mockPost;

		const service = new LoginService();

		const token = await service.authenticate({
			email: "test@example.com",
			password: "Password123!",
		});

		expect(token).toBe("token-123");
		expect(mockPost).toHaveBeenCalledWith("/auth/login", {
			email: "test@example.com",
			password: "Password123!",
		});
	});

	it("returns token when backend responds with token field", async () => {
		const mockPost = vi.fn().mockResolvedValue({
			data: { token: "token-456" },
		});
		vi.mocked(apiClient).post = mockPost;

		const service = new LoginService();

		const token = await service.authenticate({
			email: "test@example.com",
			password: "Password123!",
		});

		expect(token).toBe("token-456");
	});

	it("throws generic error for any auth failure", async () => {
		const mockError = new Error("401");
		mockError.message = "401 Unauthorized";
		const mockPost = vi.fn().mockRejectedValue(mockError);
		vi.mocked(apiClient).post = mockPost;

		const service = new LoginService();

		await expect(
			service.authenticate({
				email: "test@example.com",
				password: "wrong",
			}),
		).rejects.toEqual(
			expect.objectContaining({
				statusCode: 500,
				message: "Login failed. Please try again.",
			}),
		);
	});

	it("throws generic error for invalid backend responses", async () => {
		const mockPost = vi.fn().mockResolvedValue({
			data: { token: "" },
		});
		vi.mocked(apiClient).post = mockPost;

		const service = new LoginService();

		await expect(
			service.authenticate({
				email: "test@example.com",
				password: "Password123!",
			}),
		).rejects.toEqual(
			expect.objectContaining({
				statusCode: 500,
				message: "Login failed. Please try again.",
			}),
		);
	});
});