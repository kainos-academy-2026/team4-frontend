import type { Request, Response } from "express";

import type { RegisterService } from "../services/registerService";
import { RegisterServiceError } from "../services/registerServiceError";
import type { RegisterUserPayload } from "../services/registerServiceModels";

export class RegisterController {
	constructor(private readonly registerService: RegisterService) {}

	private mapRegistrationStatusToResponse(statusCode: number): {
		variant: "success" | "error";
		message: string;
	} {
		if (statusCode === 201) {
			return {
				variant: "success",
				message: "Registration Successful, redirecting you to the login page",
			};
		}

		if (statusCode === 400) {
			return {
				variant: "error",
				message:
					"Your registration details are invalid. Check your email and password and try again.",
			};
		}

		if (statusCode === 409) {
			return {
				variant: "error",
				message:
					"That email is already registered. Try logging in or use a different email.",
			};
		}

		if (statusCode === 500) {
			return {
				variant: "error",
				message:
					"Something went wrong on our side. Please try again in a moment.",
			};
		}

		return {
			variant: "error",
			message: "Something went wrong. Please try again.",
		};
	}

	getRegister(_request: Request, response: Response): void {
		response.render("register");
	}

	async postRegister(request: Request, response: Response): Promise<void> {
		try {
			const payload: RegisterUserPayload = {
				email: request.body.email,
				password: request.body.password,
			};

			const registeredUser = await this.registerService.register(payload);
			response.status(201).json({
				...registeredUser,
				...this.mapRegistrationStatusToResponse(201),
			});
		} catch (controllerError) {
			if (controllerError instanceof RegisterServiceError) {
				response.status(controllerError.status).json({
					message: this.mapRegistrationStatusToResponse(controllerError.status)
						.message,
					variant: "error",
				});
				return;
			}

			response.status(500).json({
				...this.mapRegistrationStatusToResponse(500),
			});
		}
	}
}
