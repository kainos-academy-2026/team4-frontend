import type { Request, Response } from "express";
import type { LoginRequestDto } from "../dto/loginDto";
import type { LoginService } from "../services/loginService";
import { LoginServiceError } from "../services/loginServiceError";
import {
	clearAccessTokenCookie,
	setAccessTokenCookie,
} from "../utils/cookieHelpers";
import { logger } from "../utils/logger";

export class LoginController {
	constructor(private readonly loginService: LoginService) {}

	getLogin = (_request: Request, response: Response): void => {
		response.render("login", {
			errorMessage: null,
		});
	};

	postLogin = async (request: Request, response: Response): Promise<void> => {
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

			setAccessTokenCookie(response, accessToken);
			response.redirect("/");
		} catch (error) {
			logger.warn("Login attempt failed", {
				email,
				endpoint: "POST /login",
				errorType: error instanceof Error ? error.constructor.name : "Unknown",
			});

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

export const postLogout = (_request: Request, response: Response): void => {
	clearAccessTokenCookie(response);
	response.redirect("/");
};
