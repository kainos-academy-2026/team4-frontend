import type { Request, Response } from "express";

import { mapRegistrationStatusToResponse } from "../mappers/registerMapper";
import type { RegisterService } from "../services/registerService";
import { RegisterServiceError } from "../services/registerServiceError";
import type { RegisterUserPayload } from "../services/registerServiceModels";

export class RegisterController {
	constructor(private readonly registerService: RegisterService) {}

	private mapRegistrationStatusToResponse(statusCode: number): {
		variant: "success" | "error";
		message: string;
	} {
		return mapRegistrationStatusToResponse(statusCode);
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
