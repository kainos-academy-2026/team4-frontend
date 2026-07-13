import type { Request, Response } from "express";

import { isDemoAuthEnabled } from "../config/auth";
import { getAccessTokenFromRequest, getEmailFromJwtPayload } from "../utils/auth";

export const getHome = (request: Request, response: Response): void => {
	const accessToken = getAccessTokenFromRequest(request);
	const userEmail = accessToken ? getEmailFromJwtPayload(accessToken) : null;

	response.render("index", {
		demoAuthEnabled: isDemoAuthEnabled(),
		isAuthenticated: Boolean(accessToken),
		userEmail,
	});
};
