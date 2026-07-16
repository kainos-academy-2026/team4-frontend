import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { RegisterController } from "../../src/controllers/registerController";
import { RegisterServiceError } from "../../src/services/registerServiceError";
import type { RegisteredUser } from "../../src/services/registerServiceModels";

describe("RegisterController", () => {
	it("renders the register page", () => {
		const render = vi.fn();
		const registerService = {
			register: vi.fn(),
		};

		const controller = new RegisterController(registerService as never);
		controller.getRegister({} as Request, { render } as unknown as Response);

		expect(render).toHaveBeenCalledWith("register");
	});

	it("returns 201 with registered user payload", async () => {
		const registeredUser: RegisteredUser = {
			id: "abc123",
			email: "new.user@example.com",
			role: "user",
		};

		const registerService = {
			register: vi.fn().mockResolvedValue(registeredUser),
		};

		const status = vi.fn().mockReturnThis();
		const json = vi.fn();
		const controller = new RegisterController(registerService as never);

		await controller.postRegister(
			{
				body: {
					email: "new.user@example.com",
					password: "Password!",
				},
			} as Request,
			{ status, json } as unknown as Response,
		);

		expect(registerService.register).toHaveBeenCalledWith({
			email: "new.user@example.com",
			password: "Password!",
		});
		expect(status).toHaveBeenCalledWith(201);
		expect(json).toHaveBeenCalledWith(registeredUser);
	});

	it("returns mapped service status when registration fails", async () => {
		const registerService = {
			register: vi
				.fn()
				.mockRejectedValue(new RegisterServiceError(409, "User already exists")),
		};

		const status = vi.fn().mockReturnThis();
		const json = vi.fn();
		const controller = new RegisterController(registerService as never);

		await controller.postRegister(
			{
				body: {
					email: "existing.user@example.com",
					password: "Password!",
				},
			} as Request,
			{ status, json } as unknown as Response,
		);

		expect(status).toHaveBeenCalledWith(409);
		expect(json).toHaveBeenCalledWith({ message: "User already exists" });
	});

	it("returns 500 when registration fails unexpectedly", async () => {
		const registerService = {
			register: vi.fn().mockRejectedValue(new Error("boom")),
		};

		const status = vi.fn().mockReturnThis();
		const json = vi.fn();
		const controller = new RegisterController(registerService as never);

		await controller.postRegister(
			{
				body: {
					email: "new.user@example.com",
					password: "Password!",
				},
			} as Request,
			{ status, json } as unknown as Response,
		);

		expect(status).toHaveBeenCalledWith(500);
		expect(json).toHaveBeenCalledWith({ message: "Internal server error" });
	});
});
