import type { Request, Response } from "express";

import { isDemoAuthEnabled } from "../config/auth";
import {
	type LoginPayload,
	LoginService,
	LoginServiceError,
} from "../services/loginService";

const loginService = new LoginService();

export const getLogin = (_request: Request, response: Response): void => {
	response.render("login", {
		demoAuthEnabled: isDemoAuthEnabled(),
	});
};

export const postLogin = async (
	request: Request,
	response: Response,
): Promise<void> => {
	try {
		const payload: LoginPayload = {
			email: request.body.email,
			password: request.body.password,
		};

		const loginResult = await loginService.login(payload);
		response.status(200).json(loginResult);
	} catch (controllerError) {
		if (controllerError instanceof LoginServiceError) {
			response
				.status(controllerError.status)
				.json({ message: controllerError.message });
			return;
		}

		response.status(500).json({ message: "Internal server error" });
	}
};
