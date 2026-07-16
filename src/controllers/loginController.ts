import type { Request, Response } from "express";
import { isDemoAuthEnabled } from "../config/auth";
import type { LoginRequestDto } from "../dto/loginDto";
import type { LoginService } from "../services/loginService";
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
			demoAuthEnabled: isDemoAuthEnabled(),
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
