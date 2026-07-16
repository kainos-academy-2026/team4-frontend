import type { NextFunction, Request, Response } from "express";

export type AuthRole = "applicant" | "recruitment_admin" | "user";

type JwtPayload = {
	email?: unknown;
	role?: unknown;
};

const parseJwtPayload = (token: string): JwtPayload | null => {
	const tokenParts = token.split(".");
	if (tokenParts.length < 2) {
		return null;
	}

	const payloadPart = tokenParts[1];
	if (!payloadPart) {
		return null;
	}

	try {
		return JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as JwtPayload;
	} catch {
		return null;
	}
};

const isAuthRole = (value: unknown): value is AuthRole =>
	value === "applicant" || value === "recruitment_admin" || value === "user";

const redirectToLogin = (response: Response): void => {
	response.redirect("/login");
};

const unauthorizedJson = (response: Response): void => {
	response.status(401).json({ message: "Authentication required." });
};

const forbiddenHtml = (response: Response): void => {
	response.status(403).send("Forbidden");
};

const forbiddenJson = (response: Response): void => {
	response.status(403).json({ message: "You do not have access to this resource." });
};

export const setAuthContext = (
	request: Request,
	response: Response,
	next: NextFunction,
): void => {
	const accessToken = request.cookies.access_token as string | undefined;
	const payload = accessToken ? parseJwtPayload(accessToken) : null;
	const userEmail = typeof payload?.email === "string" ? payload.email : null;
	const userRole = isAuthRole(payload?.role) ? payload.role : null;
	const isAuthenticated = Boolean(accessToken && userEmail && userRole);

	response.locals.accessToken = isAuthenticated ? accessToken : null;
	response.locals.userRole = isAuthenticated ? userRole : null;
	response.locals.isAuthenticated = isAuthenticated;
	response.locals.userEmail = userEmail;
	next();
};

export const requireAuthHtml = (
	request: Request,
	response: Response,
	next: NextFunction,
): void => {
	if (!response.locals.isAuthenticated) {
		redirectToLogin(response);
		return;
	}

	next();
};

export const requireAuthJson = (
	request: Request,
	response: Response,
	next: NextFunction,
): void => {
	if (!response.locals.isAuthenticated) {
		unauthorizedJson(response);
		return;
	}

	next();
};

export const requireRoleHtml = (allowedRoles: readonly AuthRole[]) => {
	return (request: Request, response: Response, next: NextFunction): void => {
		if (!response.locals.isAuthenticated) {
			redirectToLogin(response);
			return;
		}

		if (!allowedRoles.includes(response.locals.userRole as AuthRole)) {
			forbiddenHtml(response);
			return;
		}

		next();
	};
};

export const requireRoleJson = (allowedRoles: readonly AuthRole[]) => {
	return (request: Request, response: Response, next: NextFunction): void => {
		if (!response.locals.isAuthenticated) {
			unauthorizedJson(response);
			return;
		}

		if (!allowedRoles.includes(response.locals.userRole as AuthRole)) {
			forbiddenJson(response);
			return;
		}

		next();
	};
};
