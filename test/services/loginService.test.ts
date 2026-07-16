import axios from "axios";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import apiClient from "../../src/config/apiClient";
import { LoginService } from "../../src/services/loginService";
import { LoginServiceError } from "../../src/services/loginServiceError";

vi.mock("../../src/config/apiClient");

describe("LoginService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns an access token when authentication succeeds", async () => {
		const mockPost = vi.fn().mockResolvedValue({
			data: { accessToken: "token-123" },
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
			data: { accessToken: "" },
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

	it("returns login result when API login succeeds", async () => {
		const mockPost = vi.fn().mockResolvedValue({
			data: { token: "jwt-token", email: "test@example.com" },
		});
		vi.mocked(apiClient).post = mockPost;

		const service = new LoginService();

		const result = await service.login({
			email: "test@example.com",
			password: "Password123!",
		});

		expect(result).toEqual({ token: "jwt-token", email: "test@example.com" });
		expect(mockPost).toHaveBeenCalledWith("/auth/login", {
			email: "test@example.com",
			password: "Password123!",
		});
	});

	it("maps Axios 400 to invalid payload error", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		const mockPost = vi.fn().mockRejectedValue({ response: { status: 400 } });
		vi.mocked(apiClient).post = mockPost;

		const service = new LoginService();

		await expect(
			service.login({ email: "invalid", password: "" }),
		).rejects.toEqual(
			expect.objectContaining({
				statusCode: 400,
				message: "Invalid login payload",
			}),
		);
	});

	it("maps Axios 401 to invalid credentials error", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		const mockPost = vi.fn().mockRejectedValue({ response: { status: 401 } });
		vi.mocked(apiClient).post = mockPost;

		const service = new LoginService();

		await expect(
			service.login({ email: "test@example.com", password: "wrong" }),
		).rejects.toEqual(
			expect.objectContaining({
				statusCode: 401,
				message: "Invalid email or password",
			}),
		);
	});

	it("maps other Axios status codes to internal server error", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
		const mockPost = vi.fn().mockRejectedValue({ response: { status: 503 } });
		vi.mocked(apiClient).post = mockPost;

		const service = new LoginService();

		await expect(
			service.login({ email: "test@example.com", password: "Password123!" }),
		).rejects.toEqual(
			expect.objectContaining({
				statusCode: 500,
				message: "Internal server error",
			}),
		);
	});

	it("maps non-Axios login failures to internal server error", async () => {
		vi.spyOn(axios, "isAxiosError").mockReturnValue(false);
		const mockPost = vi.fn().mockRejectedValue(new Error("network down"));
		vi.mocked(apiClient).post = mockPost;

		const service = new LoginService();

		await expect(
			service.login({ email: "test@example.com", password: "Password123!" }),
		).rejects.toEqual(
			expect.objectContaining({
				statusCode: 500,
				message: "Internal server error",
			}),
		);
	});
});