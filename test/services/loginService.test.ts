import axios, { AxiosError } from "axios";
import { describe, expect, it, vi } from "vitest";

import { LoginService } from "../../src/services/loginService";
import { LoginServiceError } from "../../src/services/loginServiceError";

describe("LoginService", () => {
	it("returns an access token when the backend authenticates successfully", async () => {
		const client = {
			post: vi.fn().mockResolvedValue({
				data: { accessToken: "header.payload.signature" },
			}),
		};

		const service = new LoginService(client as never);

		const token = await service.authenticate({
			email: "test@example.com",
			password: "Password123!",
		});

		expect(token).toBe("header.payload.signature");
		expect(client.post).toHaveBeenCalledWith("/auth/login", {
			email: "test@example.com",
			password: "Password123!",
		});
	});

	it("throws 400 error when email is missing", async () => {
		const client = { post: vi.fn() };
		const service = new LoginService(client as never);

		await expect(
			service.authenticate({ email: "", password: "Password123!" }),
		).rejects.toEqual(
			expect.objectContaining<LoginServiceError>({
				statusCode: 400,
				message: "Invalid login payload",
			}),
		);
		expect(client.post).not.toHaveBeenCalled();
	});

	it("throws 400 error when password is missing", async () => {
		const client = { post: vi.fn() };
		const service = new LoginService(client as never);

		await expect(
			service.authenticate({ email: "test@example.com", password: "" }),
		).rejects.toEqual(
			expect.objectContaining<LoginServiceError>({
				statusCode: 400,
				message: "Invalid login payload",
			}),
		);
		expect(client.post).not.toHaveBeenCalled();
	});

	it("maps a 401 backend response to invalid credentials", async () => {
		const client = {
			post: vi.fn().mockRejectedValue(
				new AxiosError("Unauthorized", "401", undefined, undefined, {
					status: 401,
					statusText: "Unauthorized",
					headers: {},
					config: {
						headers: axios.AxiosHeaders.from({}),
					},
					data: { message: "Invalid email or password" },
				}),
			),
		};

		const service = new LoginService(client as never);

		await expect(
			service.authenticate({
				email: "test@example.com",
				password: "wrong-password",
			}),
		).rejects.toEqual(
			new LoginServiceError(401, "Invalid email or password."),
		);
	});

	it("maps a 400 backend response to invalid login payload", async () => {
		const client = {
			post: vi.fn().mockRejectedValue(
				new AxiosError("Bad request", "400", undefined, undefined, {
					status: 400,
					statusText: "Bad Request",
					headers: {},
					config: {
						headers: axios.AxiosHeaders.from({}),
					},
					data: { message: "Invalid login payload" },
				}),
			),
		};

		const service = new LoginService(client as never);

		await expect(
			service.authenticate({
				email: "test@example.com",
				password: "Password123!",
			}),
		).rejects.toEqual(new LoginServiceError(400, "Invalid login payload"));
	});

	it("maps unexpected backend failures to a 502 service unavailable error", async () => {
		const client = {
			post: vi.fn().mockRejectedValue(new Error("Network error")),
		};

		const service = new LoginService(client as never);

		await expect(
			service.authenticate({
				email: "test@example.com",
				password: "Password123!",
			}),
		).rejects.toEqual(
			new LoginServiceError(
				502,
				"Login service unavailable. Please try again later.",
			),
		);
	});
});
