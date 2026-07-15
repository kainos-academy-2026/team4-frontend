import type { NextFunction, Request, Response } from "express";

let decodeJwtFn: ((token: string) => Record<string, unknown>) | undefined;

const getDecoder = async () => {
	if (!decodeJwtFn) {
		const jose = await import("jose");
		decodeJwtFn = jose.decodeJwt;
	}
	return decodeJwtFn;
};

// Preload decoder to avoid first-request latency
getDecoder().catch(() => {
	// Initialization error - will retry on first use
});

export const setAuthContext = (
	request: Request,
	response: Response,
	next: NextFunction,
): void => {
	const accessToken = request.cookies.access_token as string | undefined;

	let userEmail: string | null = null;
	if (accessToken && decodeJwtFn) {
		try {
			const payload = decodeJwtFn(accessToken) as { email?: unknown };
			userEmail = typeof payload.email === "string" ? payload.email : null;
		} catch {
			// ignore JWT decoding errors
		}
	}

	response.locals.isAuthenticated = Boolean(accessToken);
	response.locals.userEmail = userEmail;
	next();
};
