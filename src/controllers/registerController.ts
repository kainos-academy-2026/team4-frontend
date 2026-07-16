import type { Request, Response } from "express";

import type { RegisterService } from "../services/registerService";
import { RegisterServiceError } from "../services/registerServiceError";
import type { RegisterUserPayload } from "../services/registerServiceModels";

export class RegisterController {
	constructor(private readonly registerService: RegisterService) {}

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
			response.status(201).json(registeredUser);
		} catch (controllerError) {
			if (controllerError instanceof RegisterServiceError) {
				response
					.status(controllerError.status)
					.json({ message: controllerError.message });
				return;
			}

			response.status(500).json({ message: "Internal server error" });
		}
	}
}
