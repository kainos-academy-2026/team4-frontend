import axios, { AxiosError } from "axios";
import { describe, expect, it, vi } from "vitest";

import { RegisterService } from "../../src/services/registerService";
import { RegisterServiceError } from "../../src/services/registerServiceError";

describe("RegisterService", () => {
	it("returns registered user when backend responds 201", async () => {
		const client = {
			post: vi.fn().mockResolvedValue({
				data: {
					id: "new-id",
					email: "new.user@example.com",
					role: "user",
				},
			}),
		};

		const service = new RegisterService(client as never);
		const result = await service.register({
			email: "new.user@example.com",
			password: "Password!",
		});

		expect(result).toEqual({
			id: "new-id",
			email: "new.user@example.com",
			role: "user",
		});
		expect(client.post).toHaveBeenCalledWith("/auth/register", {
			email: "new.user@example.com",
			password: "Password!",
		});
	});

	it("maps 400 backend response to invalid payload", async () => {
		const client = {
			post: vi.fn().mockRejectedValue(
				new AxiosError("Bad request", "400", undefined, undefined, {
					status: 400,
					statusText: "Bad Request",
					headers: {},
					config: {
						headers: axios.AxiosHeaders.from({}),
					},
					data: { message: "Invalid registration payload" },
				}),
			),
		};

		const service = new RegisterService(client as never);

		await expect(
			service.register({ email: "new.user@example.com", password: "Password!" }),
		).rejects.toEqual(new RegisterServiceError(400, "Invalid registration payload"));
	});

	it("maps 409 backend response to duplicate user", async () => {
		const client = {
			post: vi.fn().mockRejectedValue(
				new AxiosError("Conflict", "409", undefined, undefined, {
					status: 409,
					statusText: "Conflict",
					headers: {},
					config: {
						headers: axios.AxiosHeaders.from({}),
					},
					data: { message: "User already exists" },
				}),
			),
		};

		const service = new RegisterService(client as never);

		await expect(
			service.register({ email: "existing.user@example.com", password: "Password!" }),
		).rejects.toEqual(new RegisterServiceError(409, "User already exists"));
	});

	it("maps unknown errors to internal server error", async () => {
		const client = {
			post: vi.fn().mockRejectedValue(new Error("Unexpected failure")),
		};

		const service = new RegisterService(client as never);

		await expect(
			service.register({ email: "new.user@example.com", password: "Password!" }),
		).rejects.toEqual(new RegisterServiceError(500, "Internal server error"));
	});

	it("maps unexpected Axios statuses to internal server error", async () => {
		const client = {
			post: vi.fn().mockRejectedValue(
				new AxiosError("Teapot", "418", undefined, undefined, {
					status: 418,
					statusText: "I'm a teapot",
					headers: {},
					config: {
						headers: axios.AxiosHeaders.from({}),
					},
					data: { message: "Unexpected" },
				}),
			),
		};

		const service = new RegisterService(client as never);

		await expect(
			service.register({ email: "new.user@example.com", password: "Password!" }),
		).rejects.toEqual(new RegisterServiceError(500, "Internal server error"));
	});
});
