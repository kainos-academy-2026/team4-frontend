import type { Request, Response } from "express";

import type { LoginRequestDto } from "../dto/loginDto";
import { type LoginService, LoginServiceError } from "../services/loginService";

export class LoginController {
	constructor(private readonly loginService: LoginService) {}

	getLogin = (_request: Request, response: Response): void => {
		response.render("login", {
			errorMessage: null,
		});
	};

	postLogin = async (request: Request, response: Response): Promise<void> => {
		const { email, password } = request.body as LoginRequestDto;

		try {
			const accessToken = await this.loginService.authenticate({
				email,
				password,
			});

			response.cookie("access_token", accessToken, {
				httpOnly: true,
				sameSite: "lax",
				maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
			});
			response.redirect("/");
		} catch (error) {
			if (error instanceof LoginServiceError) {
				response.status(error.statusCode).render("login", {
					errorMessage: error.message,
				});
				return;
			}

			response.status(500).render("login", {
				errorMessage: "Something went wrong. Please try again.",
			});
		}
	};

	postLogout = (_request: Request, response: Response): void => {
		response.clearCookie("access_token");
		response.redirect("/");
	};
}

// Export handler functions for routing
export const getLogin = (_request: Request, response: Response): void => {
	response.render("login", {
		errorMessage: null,
	});
};

export const postLogout = (_request: Request, response: Response): void => {
	response.clearCookie("access_token");
	response.redirect("/");
};
