import { beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError } from "axios";

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

	it("returns login payload when login succeeds", async () => {
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

	it("maps 400 login responses to invalid payload error", async () => {
		const mockPost = vi.fn().mockRejectedValue(
			new AxiosError("Bad request", "400", undefined, undefined, {
				status: 400,
				statusText: "Bad Request",
				headers: {},
				config: {
					headers: {} as never,
				},
				data: { message: "Invalid login payload" },
			}),
		);
		vi.mocked(apiClient).post = mockPost;

		const service = new LoginService();

		await expect(
			service.login({ email: "test@example.com", password: "Password123!" }),
		).rejects.toEqual(new LoginServiceError(400, "Invalid login payload"));
	});

	it("maps 401 login responses to invalid credentials error", async () => {
		const mockPost = vi.fn().mockRejectedValue(
			new AxiosError("Unauthorized", "401", undefined, undefined, {
				status: 401,
				statusText: "Unauthorized",
				headers: {},
				config: {
					headers: {} as never,
				},
				data: { message: "Invalid email or password" },
			}),
		);
		vi.mocked(apiClient).post = mockPost;

		const service = new LoginService();

		await expect(
			service.login({ email: "test@example.com", password: "Password123!" }),
		).rejects.toEqual(new LoginServiceError(401, "Invalid email or password"));
	});

	it("maps Axios-like 401 errors to invalid credentials error", async () => {
		const mockPost = vi.fn().mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 401,
			},
		});
		vi.mocked(apiClient).post = mockPost;

		const service = new LoginService();

		await expect(
			service.login({ email: "test@example.com", password: "Password123!" }),
		).rejects.toEqual(new LoginServiceError(401, "Invalid email or password"));
	});

	it("maps unknown login failures to internal server error", async () => {
		const mockPost = vi.fn().mockRejectedValue(new Error("boom"));
		vi.mocked(apiClient).post = mockPost;

		const service = new LoginService();

		await expect(
			service.login({ email: "test@example.com", password: "Password123!" }),
		).rejects.toEqual(new LoginServiceError(500, "Internal server error"));
	});
});
