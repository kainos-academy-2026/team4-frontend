import type { Request, Response } from "express";
import type { LoginRequestDto } from "../dto/loginDto";
import { LoginService } from "../services/loginService";
import { LoginServiceError } from "../services/loginServiceError";
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
			if (error instanceof LoginServiceError) {
				response.status(error.statusCode).render("login", {
					errorMessage: error.message,
				});
				return;
			}

			response.status(502).render("login", {
				errorMessage: "Login service unavailable. Please try again later.",
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

export const postLogout = (_request: Request, response: Response): void => {
	clearAccessTokenCookie(response);
	response.redirect("/");
};
