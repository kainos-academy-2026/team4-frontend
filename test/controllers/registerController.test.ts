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
		expect(json).toHaveBeenCalledWith({
			...registeredUser,
			variant: "success",
			message: "Registration Successful, redirecting you to the login page",
		});
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
		expect(json).toHaveBeenCalledWith({
			message:
				"That email is already registered. Try logging in or use a different email.",
			variant: "error",
		});
	});

	it("returns mapped 400 status message for invalid registration payload", async () => {
		const registerService = {
			register: vi
				.fn()
				.mockRejectedValue(new RegisterServiceError(400, "Invalid registration payload")),
		};

		const status = vi.fn().mockReturnThis();
		const json = vi.fn();
		const controller = new RegisterController(registerService as never);

		await controller.postRegister(
			{
				body: {
					email: "invalid-email",
					password: "password",
				},
			} as Request,
			{ status, json } as unknown as Response,
		);

		expect(status).toHaveBeenCalledWith(400);
		expect(json).toHaveBeenCalledWith({
			message:
				"Your registration details are invalid. Check your email and password and try again.",
			variant: "error",
		});
	});

	it("falls back to default error message for unknown status mapping", () => {
		const controller = new RegisterController({ register: vi.fn() } as never);

		const mapped = (
			controller as unknown as {
				mapRegistrationStatusToResponse: (statusCode: number) => {
					variant: "success" | "error";
					message: string;
				};
			}
		).mapRegistrationStatusToResponse(418);

		expect(mapped).toEqual({
			variant: "error",
			message: "Something went wrong. Please try again.",
		});
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
		expect(json).toHaveBeenCalledWith({
			variant: "error",
			message: "Something went wrong on our side. Please try again in a moment.",
		});
	});
});
