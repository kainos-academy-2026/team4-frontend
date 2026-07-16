import { describe, expect, it, vi } from "vitest";

import { AuthService } from "../../src/services/authService";

vi.mock("../../src/config/apiClient");

describe("AuthService", () => {
	describe("login", () => {
		it("returns login response data on successful login", async () => {
			const mockClient = {
				post: vi.fn().mockResolvedValue({
					data: { accessToken: "header.payload.signature" },
				}),
			};

			const service = new AuthService(mockClient as never);
			const result = await service.login("test@test.com", "password");

			expect(result).toEqual({ accessToken: "header.payload.signature" });
			expect(mockClient.post).toHaveBeenCalledWith("/auth/login", {
				email: "test@test.com",
				password: "password",
			});
		});

		it("propagates errors from the client", async () => {
			const mockClient = {
				post: vi.fn().mockRejectedValue(new Error("network error")),
			};

			const service = new AuthService(mockClient as never);
			await expect(service.login("test@test.com", "wrong")).rejects.toThrow("network error");
		});

		it("propagates axios errors (e.g. 401) from the client", async () => {
			const axiosError = {
				isAxiosError: true,
				response: { status: 401, data: { message: "Unauthorized" } },
			};
			const mockClient = {
				post: vi.fn().mockRejectedValue(axiosError),
			};

			const service = new AuthService(mockClient as never);
			await expect(service.login("test@test.com", "wrong")).rejects.toMatchObject({
				isAxiosError: true,
				response: { status: 401 },
			});
		});
	});
});
