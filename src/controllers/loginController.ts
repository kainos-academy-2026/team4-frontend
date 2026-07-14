import type { Request, Response } from "express";

import type { LoginResponseDto } from "../dto/loginDto";
import {
	clearAccessTokenCookieHeader,
	setAccessTokenCookieHeader,
} from "../utils/auth";

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
		response.status(400).render("login", {
			errorMessage: "Please enter both your email and password.",
		});
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
		response.status(502).render("login", {
			errorMessage: "We could not reach the login service. Please try again.",
		});
		return;
	}

	if (apiResponse.status === 401) {
		response.status(401).render("login", {
			errorMessage: "Invalid email or password. Please try again.",
		});
		return;
	}

	if (apiResponse.status === 400) {
		response.status(400).render("login", {
			errorMessage: "Please enter a valid email and password.",
		});
		return;
	}

	if (!apiResponse.ok) {
		response.status(502).render("login", {
			errorMessage: "The login service returned an unexpected response.",
		});
		return;
	}

	const payload = (await apiResponse.json()) as Partial<LoginResponseDto>;
	if (
		typeof payload.accessToken !== "string" ||
		payload.accessToken.length === 0
	) {
		response.status(502).render("login", {
			errorMessage: "The login response was invalid. Please try again.",
		});
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
