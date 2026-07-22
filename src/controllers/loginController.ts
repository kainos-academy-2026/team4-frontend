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
			if (error instanceof LoginServiceError) {
				try {
					response.status(error.statusCode).render("login", {
						errorMessage: error.message,
					});
				} catch (renderError) {
					logger.warn("Failed to render login page with error", {
						email,
						renderErrorType:
							renderError instanceof Error
								? renderError.constructor.name
								: typeof renderError,
					});
					response.status(500).json({ message: "Failed to render login page" });
				}
				return;
			}

			// Log error without passing the full error object to avoid serialization issues
			logger.warn("Login attempt failed - unexpected error", {
				email,
				endpoint: "POST /login",
				errorType:
					error instanceof Error ? error.constructor.name : typeof error,
			});

			try {
				response.status(502).render("login", {
					errorMessage: "Login service unavailable. Please try again later.",
				});
			} catch (renderError) {
				logger.warn("Failed to render login error page", {
					email,
					renderErrorType:
						renderError instanceof Error
							? renderError.constructor.name
							: typeof renderError,
				});
				response.status(500).json({ message: "Login service unavailable" });
			}
		}
	};

	postLogout = (_request: Request, response: Response): void => {
		clearAccessTokenCookie(response);
		response.redirect("/");
	};
}
