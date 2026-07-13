import type { Request, Response } from "express";

import {
	AUTH_COOKIE_NAME,
	authenticateDemoUser,
	readAuthSession,
} from "../auth/session";
import { isDemoAuthEnabled } from "../config/auth";

export const getLogin = (req: Request, res: Response): void => {
	if (readAuthSession(req)) {
		res.redirect("/");
		return;
	}

	res.render("login", {
		demoAuthEnabled: isDemoAuthEnabled(),
	});
};

export const postLogin = (req: Request, res: Response): void => {
	if (!isDemoAuthEnabled()) {
		res.status(503).json({ message: "Demo login is currently unavailable." });
		return;
	}

	const email = String(req.body.email ?? "").trim();
	const password = String(req.body.password ?? "");
	const session = authenticateDemoUser(email, password);

	if (!session) {
		res.status(401).json({ message: "Invalid email or password. Please try again." });
		return;
	}

	res.cookie(AUTH_COOKIE_NAME, session.token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	});
	res.json({
		email: session.email,
		redirectTo: "/",
		role: session.role,
		token: session.token,
	});
};

export const postLogout = (_req: Request, res: Response): void => {
	res.clearCookie(AUTH_COOKIE_NAME);
	res.status(204).send();
};
