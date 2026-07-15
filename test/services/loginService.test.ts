import axios, { AxiosError } from "axios";
import { describe, expect, it, vi } from "vitest";

import { LoginService, LoginServiceError } from "../../src/services/loginService";

describe("LoginService", () => {
	it("returns backend login payload on success", async () => {
		const client = {
			post: vi.fn().mockResolvedValue({
				data: {
					token: "jwt-token",
					email: "j@kainos.com",
				},
			}),
		};

		const service = new LoginService(client as never);
		const result = await service.login({
			email: "j@kainos.com",
			password: "Password01!",
		});

		expect(result).toEqual({
			token: "jwt-token",
			email: "j@kainos.com",
		});
	});

	it("maps 400 to invalid login payload", async () => {
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
			service.login({ email: "j@kainos.com", password: "Password01!" }),
		).rejects.toEqual(new LoginServiceError(400, "Invalid login payload"));
	});

	it("maps 401 to invalid credentials", async () => {
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
			service.login({ email: "j@kainos.com", password: "Password01!" }),
		).rejects.toEqual(new LoginServiceError(401, "Invalid email or password"));
	});
});
