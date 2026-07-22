import type { NextFunction, Request, Response } from "express";
import type { Role } from "../models/role";
import { clearAccessTokenCookie } from "../utils/cookieHelpers";
import { logger } from "../utils/logger";

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

export const authorize = (allowedRoles: readonly Role[]) => {
	return async (
		request: Request,
		response: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const token = request.cookies.access_token;
			if (!token) {
				response.redirect("/login");
				return;
			}

			// Dynamically import decodeJwt to handle ESM module
			const { decodeJwt } = await import("jose");
			const decodedToken = await decodeJwt(token);
			if (!decodedToken) {
				response.redirect("/login");
				return;
			}

			const userIdFromToken = decodedToken.sub;
			if (typeof userIdFromToken !== "string" || !userIdFromToken.trim()) {
				response.redirect("/login");
				return;
			}

			if (!allowedRoles.includes(decodedToken.role as Role)) {
				response.status(403).render("not-found", {
					title: "Forbidden",
					message: "You do not have access to this page.",
				});
				return;
			}

			response.locals.user = {
				id: userIdFromToken,
				email: typeof decodedToken.email === "string" ? decodedToken.email : "",
				role: decodedToken.role,
			};

			next();
		} catch (error) {
			// An invalid or expired access_token cookie is an expected occurrence
			// (not an application bug), so clear it and send the user back to
			// login instead of leaving a stale cookie that fails on every request.
			clearAccessTokenCookie(response);
			logger.warn("Rejected request with invalid or expired access token", {
				errorType:
					error instanceof Error ? error.constructor.name : typeof error,
			});
			response.redirect("/login");
			return;
		}
	};
};
