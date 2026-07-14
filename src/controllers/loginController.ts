import type { Request, Response } from "express";

import { isDemoAuthEnabled } from "../config/auth";
import {
	clearAccessTokenCookieHeader,
	setAccessTokenCookieHeader,
} from "../utils/auth";

type LoginResponseDto = {
	accessToken: string;
};

const renderLoginWithError = (
	response: Response,
	statusCode: number,
	errorMessage: string,
): void => {
	response.status(statusCode).render("login", {
		demoAuthEnabled: isDemoAuthEnabled(),
		errorMessage,
	});
};

export const getLogin = (_request: Request, response: Response): void => {
	response.render("login", {
		errorMessage: null,
	});
};

export const postLogin = async (
	request: Request,
	response: Response,
): Promise<void> => {
	const email = String(request.body?.email ?? "").trim();
	const password = String(request.body?.password ?? "");

	if (!email || !password) {
		renderLoginWithError(
			response,
			400,
			"Please enter both your email and password.",
		);
		return;
	}

	const apiBaseUrl = process.env.API_BASE_URL;

	let apiResponse: globalThis.Response;
	try {
		apiResponse = await fetch(`${apiBaseUrl}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		});
	} catch {
		renderLoginWithError(
			response,
			502,
			"We could not reach the login service. Please try again.",
		);
		return;
	}

	if (apiResponse.status === 401) {
		renderLoginWithError(
			response,
			401,
			"Invalid email or password. Please try again.",
		);
		return;
	}

	if (apiResponse.status === 400) {
		renderLoginWithError(
			response,
			400,
			"Please enter a valid email and password.",
		);
		return;
	}

	if (!apiResponse.ok) {
		renderLoginWithError(
			response,
			502,
			"The login service returned an unexpected response.",
		);
		return;
	}

	const payload = (await apiResponse.json()) as Partial<LoginResponseDto>;
	if (
		typeof payload.accessToken !== "string" ||
		payload.accessToken.length === 0
	) {
		renderLoginWithError(
			response,
			502,
			"The login response was invalid. Please try again.",
		);
		return;
	}

	response.setHeader(
		"Set-Cookie",
		setAccessTokenCookieHeader(payload.accessToken),
	);
	response.redirect("/");
};

export const postLogout = (_request: Request, response: Response): void => {
	response.setHeader("Set-Cookie", clearAccessTokenCookieHeader());
	response.redirect("/");
};
