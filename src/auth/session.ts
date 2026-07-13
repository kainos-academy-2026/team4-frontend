import type { Request } from "express";

export const AUTH_COOKIE_NAME = "demoAuthToken";

export type AuthRole = "applicant" | "recruitment_admin";

export type AuthSession = {
	email: string;
	role: AuthRole;
	token: string;
};

type DemoUser = {
	password: string;
	role: AuthRole;
};

type DemoTokenPayload = {
	email: string;
	role: AuthRole;
	exp: number;
};

const demoUsers: Record<string, DemoUser> = {
	"admin@test.com": {
		password: "passwordadmin",
		role: "recruitment_admin",
	},
	"test@test.com": {
		password: "passwordtest",
		role: "applicant",
	},
};

const isAuthRole = (value: unknown): value is AuthRole =>
	value === "applicant" || value === "recruitment_admin";

const encodeSection = (value: Record<string, unknown>): string =>
	Buffer.from(JSON.stringify(value)).toString("base64url");

const decodePayload = (value: string): DemoTokenPayload | null => {
	try {
		return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as DemoTokenPayload;
	} catch {
		return null;
	}
};

const parseCookieHeader = (cookieHeader?: string): Record<string, string> => {
	if (!cookieHeader) {
		return {};
	}

	return Object.fromEntries(
		cookieHeader
			.split(";")
			.map((part) => part.trim())
			.filter((part) => part.length > 0)
			.map((part) => {
				const separatorIndex = part.indexOf("=");
				if (separatorIndex === -1) {
					return [part, ""];
				}

				return [
					decodeURIComponent(part.slice(0, separatorIndex)),
					decodeURIComponent(part.slice(separatorIndex + 1)),
				];
			}),
	);
};

export const createDemoToken = (email: string, role: AuthRole): string => {
	const header = encodeSection({ alg: "HS256", typ: "JWT" });
	const payload = encodeSection({
		email,
		role,
		exp: Math.floor(Date.now() / 1000) + 60 * 60,
	});

	return `${header}.${payload}.demo-signature`;
};

export const parseDemoToken = (token: string): AuthSession | null => {
	const tokenParts = token.split(".");
	if (tokenParts.length !== 3) {
		return null;
	}

	const payload = decodePayload(tokenParts[1] ?? "");
	if (!payload) {
		return null;
	}

	if (
		typeof payload.email !== "string" ||
		!isAuthRole(payload.role) ||
		typeof payload.exp !== "number" ||
		payload.exp <= Math.floor(Date.now() / 1000)
	) {
		return null;
	}

	return {
		email: payload.email,
		role: payload.role,
		token,
	};
};

export const authenticateDemoUser = (
	email: string,
	password: string,
): AuthSession | null => {
	const user = demoUsers[email];
	if (!user || user.password !== password) {
		return null;
	}

	return {
		email,
		role: user.role,
		token: createDemoToken(email, user.role),
	};
};

export const readAuthSession = (req: Request): AuthSession | null => {
	const token = parseCookieHeader(req.headers?.cookie)[AUTH_COOKIE_NAME];
	if (!token) {
		return null;
	}

	return parseDemoToken(token);
};