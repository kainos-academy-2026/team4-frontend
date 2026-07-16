import type { Request, Response } from "express";

import type { LoginRequestDto } from "../dto/loginDto";
import { LoginService } from "../services/loginService";
import { LoginServiceError } from "../services/loginServiceError";
import {
	clearAccessTokenCookie,
	setAccessTokenCookie,
} from "../utils/cookieHelpers";

export class LoginController {
	constructor(private readonly loginService: LoginService) {}

	getLogin = (_request: Request, response: Response): void => {
		response.render("login", {
			errorMessage: null,
		});
	};

	postLogin = async (request: Request, response: Response): Promise<void> => {
		// Check for errors from middleware
		if (response.locals.errors) {
			response.status(400).render("login", {
				errorMessage: "Please enter both your email and password.",
			});
			return;
		}

		const { email, password } = request.body as LoginRequestDto;

		try {
			const accessToken = await this.loginService.authenticate({
				email,
				password,
			});

			response.cookie("access_token", accessToken)
			response.redirect("/");
		} catch (_error) {
			response.status(401).render("login", {
				errorMessage: "Login failed. Please try again.",
			});
		}
	};

	postLogout = (_request: Request, response: Response): void => {
		clearAccessTokenCookie(response);
		response.redirect("/");
	};
}

// Export handler functions for routing
export const getLogin = (_request: Request, response: Response): void => {
	if (response.locals.isAuthenticated) {
		response.redirect("/");
		return;
	}

	response.render("login", {
		errorMessage: null,
	});
};

const authLoginService = new LoginService();

export const postLogin = async (
	request: Request,
	response: Response,
): Promise<void> => {
	try {
		const result = await authLoginService.login({
			email: request.body.email,
			password: request.body.password,
		});

		response.status(200).json(result);
	} catch (controllerError) {
		if (controllerError instanceof LoginServiceError) {
			response
				.status(controllerError.statusCode)
				.json({ message: controllerError.message });
			return;
		}

		response.status(500).json({ message: "Internal server error" });
	}
};

export const postLogout = (_request: Request, response: Response): void => {
	clearAccessTokenCookie(response);
	response.redirect("/");
};
