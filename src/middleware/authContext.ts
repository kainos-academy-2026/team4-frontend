import type { NextFunction, Request, Response } from "express";

const ACCESS_TOKEN_COOKIE = "access_token";

const parseCookies = (
	cookieHeader: string | undefined,
): Map<string, string> => {
	if (!cookieHeader) {
		return new Map();
	}

	return new Map(
		cookieHeader
			.split(";")
			.map((segment) => segment.trim())
			.filter((segment) => segment.length > 0)
			.map((segment) => {
				const equalsIndex = segment.indexOf("=");
				if (equalsIndex < 0) {
					return [segment, ""];
				}

				const key = segment.slice(0, equalsIndex);
				const value = segment.slice(equalsIndex + 1);
				return [key, decodeURIComponent(value)];
			}),
	);
};

const getAccessTokenFromRequest = (request: Request): string | null => {
	const cookies = parseCookies(request.headers.cookie);
	const token = cookies.get(ACCESS_TOKEN_COOKIE);
	return token ?? null;
};

const getEmailFromJwtPayload = (accessToken: string): string | null => {
	const tokenParts = accessToken.split(".");
	if (tokenParts.length < 2) {
		return null;
	}

	const payloadPart = tokenParts[1];
	if (!payloadPart) {
		return null;
	}

	try {
		const payloadText = Buffer.from(payloadPart, "base64url").toString("utf8");
		const payload = JSON.parse(payloadText) as { email?: unknown };
		return typeof payload.email === "string" ? payload.email : null;
	} catch {
		return null;
	}
};

export const setAuthContext = (
	request: Request,
	response: Response,
	next: NextFunction,
): void => {
	const accessToken = getAccessTokenFromRequest(request);
	const userEmail = accessToken ? getEmailFromJwtPayload(accessToken) : null;

	response.locals.isAuthenticated = Boolean(accessToken);
	response.locals.userEmail = userEmail;
	next();
};
