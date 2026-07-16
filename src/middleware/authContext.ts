import type { NextFunction, Request, Response } from "express";
import type { Role } from "../models/role";
import * as jose from "jose";

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

			const decodedToken = await jose.decodeJwt(token);
			if(!decodedToken) {
				response.redirect("/login");
				return;
			}

			const userId = Number(decodedToken.sub);
			if (!Number.isSafeInteger(userId) || userId <= 0) {
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