import type { NextFunction, Request, Response } from "express";

export const setAuthContext = (
	request: Request,
	response: Response,
	next: NextFunction,
): void => {
	const accessToken = request.cookies.access_token as string | undefined;

	let userEmail: string | null = null;
	if (accessToken) {
		try {
			const { decodeJwt } = require("jose");
			const payload = decodeJwt(accessToken) as { email?: unknown };
			userEmail = typeof payload.email === "string" ? payload.email : null;
		} catch {
			// ignore JWT decoding errors
		}
	}

	response.locals.isAuthenticated = Boolean(accessToken);
	response.locals.userEmail = userEmail;
	next();
};
