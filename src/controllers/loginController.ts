import type { Request, Response } from "express";

import type { LoginRequestDto } from "../dto/loginDto";
import { type LoginService, LoginServiceError } from "../services/loginService";

const ACCESS_TOKEN_COOKIE = "access_token";

const serializeTokenCookie = (
	value: string,
	maxAgeSeconds: number,
	env: NodeJS.ProcessEnv = process.env,
): string => {
	const secureFlag = env.NODE_ENV === "production" ? "; Secure" : "";
	return `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secureFlag}`;
};

const clearAccessTokenCookieHeader = (
	env: NodeJS.ProcessEnv = process.env,
): string => serializeTokenCookie("", 0, env);

const setAccessTokenCookieHeader = (
	accessToken: string,
	env: NodeJS.ProcessEnv = process.env,
): string => serializeTokenCookie(accessToken, 60 * 60, env);

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

			response.setHeader("Set-Cookie", setAccessTokenCookieHeader(accessToken));
			response.redirect("/");
		} catch (error) {
			if (error instanceof LoginServiceError && error.statusCode === 401) {
				response.status(401).render("login", {
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
		response.setHeader("Set-Cookie", clearAccessTokenCookieHeader());
		response.redirect("/");
	};
}
