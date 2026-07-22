import axios, { AxiosError } from "axios";
import { describe, expect, it, vi } from "vitest";

import { AuthService } from "../../src/services/authService";

describe("AuthService", () => {
	describe("login", () => {
		it("returns the access token from the backend on successful login", async () => {
			const client = {
				post: vi.fn().mockResolvedValue({
					data: { accessToken: "header.payload.signature" },
				}),
			};

			const service = new AuthService(client as never);
			const result = await service.login("test@test.com", "password");

			expect(result).toEqual({ accessToken: "header.payload.signature" });
			expect(client.post).toHaveBeenCalledWith("/auth/login", {
				email: "test@test.com",
				password: "password",
			});
		});

		it("propagates a 401 error when the backend rejects credentials", async () => {
			const axiosError = new AxiosError(
				"Unauthorized",
				"401",
				undefined,
				undefined,
				{
					status: 401,
					statusText: "Unauthorized",
					headers: {},
					config: {
						headers: axios.AxiosHeaders.from({}),
					},
					data: { message: "Invalid email or password" },
				},
			);
			const client = { post: vi.fn().mockRejectedValue(axiosError) };

			const service = new AuthService(client as never);

			await expect(
				service.login("test@test.com", "wrong-password"),
			).rejects.toBe(axiosError);
		});

		it("propagates unexpected errors when the backend is unavailable", async () => {
			const networkError = new Error("Network error");
			const client = { post: vi.fn().mockRejectedValue(networkError) };

			const service = new AuthService(client as never);

			await expect(
				service.login("test@test.com", "password"),
			).rejects.toBe(networkError);
		});
	});
});
