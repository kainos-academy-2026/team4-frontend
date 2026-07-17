import type { NextFunction, Request, Response } from "express";
import type { Role } from "../models/role";

type DecodedToken = {
	sub?: unknown;
	email?: unknown;
	role?: unknown;
};

const decodeJwtPayload = (token: string): DecodedToken | null => {
	const tokenParts = token.split(".");
	if (tokenParts.length < 2) {
		return null;
	}

	const payloadPart = tokenParts[1];
	if (!payloadPart) {
		return null;
	}

	try {
		return JSON.parse(
			Buffer.from(payloadPart, "base64url").toString("utf8"),
		) as DecodedToken;
	} catch {
		return null;
	}
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

			const decodedToken = decodeJwtPayload(token);
			if (!decodedToken) {
				response.redirect("/login");
				return;
			}

			const userId =
				typeof decodedToken.sub === "string" && decodedToken.sub.trim() !== ""
					? decodedToken.sub
					: null;
			if (!userId) {
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
				id: userId,
				email: typeof decodedToken.email === "string" ? decodedToken.email : "",
				role: decodedToken.role,
			};

			next();
		} catch (error) {
			console.error("Error in authorize middleware:", error);
			response.redirect("/login");
			return;
		}
	};
};
