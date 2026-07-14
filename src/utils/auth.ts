import type { Request } from "express";

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

const serializeTokenCookie = (
	value: string,
	maxAgeSeconds: number,
	env: NodeJS.ProcessEnv = process.env,
): string => {
	const secureFlag = env.NODE_ENV === "production" ? "; Secure" : "";
	return `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secureFlag}`;
};

export const clearAccessTokenCookieHeader = (
	env: NodeJS.ProcessEnv = process.env,
): string => serializeTokenCookie("", 0, env);

export const setAccessTokenCookieHeader = (
	accessToken: string,
	env: NodeJS.ProcessEnv = process.env,
): string => serializeTokenCookie(accessToken, 60 * 60, env);

export const getAccessTokenFromRequest = (request: Request): string | null => {
	const cookies = parseCookies(request.headers.cookie);
	const token = cookies.get(ACCESS_TOKEN_COOKIE);
	return token ?? null;
};

export const getEmailFromJwtPayload = (accessToken: string): string | null => {
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
