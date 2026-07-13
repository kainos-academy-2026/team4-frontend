import type { NextFunction, Request, Response } from "express";

import { type AuthRole, readAuthSession } from "../auth/session";

type FailureMode = "html" | "json";

const renderLoginRedirect = (res: Response): void => {
	res.redirect("/login");
};

const renderUnauthorized = (mode: FailureMode, res: Response): void => {
	if (mode === "html") {
		res.status(403).send("Forbidden");
		return;
	}

	res.status(403).json({ message: "You do not have access to this resource." });
};

const renderUnauthenticated = (mode: FailureMode, res: Response): void => {
	if (mode === "html") {
		renderLoginRedirect(res);
		return;
	}

	res.status(401).json({ message: "Authentication required." });
};

export const requireAuth = (mode: FailureMode) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!readAuthSession(req)) {
			renderUnauthenticated(mode, res);
			return;
		}

		next();
	};
};

export const requireRole = (
	allowedRoles: readonly AuthRole[],
	mode: FailureMode,
) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const session = readAuthSession(req);
		if (!session) {
			renderUnauthenticated(mode, res);
			return;
		}

		if (!allowedRoles.includes(session.role)) {
			renderUnauthorized(mode, res);
			return;
		}

		next();
	};
};