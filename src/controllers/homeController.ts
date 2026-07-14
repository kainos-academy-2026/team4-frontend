import type { Request, Response } from "express";

import { isDemoAuthEnabled } from "../config/auth";

export const getHome = (_request: Request, response: Response): void => {
	const { isAuthenticated, userEmail } = response.locals;

	response.render("index", {
		demoAuthEnabled: isDemoAuthEnabled(),
		isAuthenticated,
		userEmail,
	});
};
