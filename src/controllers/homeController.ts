import type { Request, Response } from "express";

import { getAccessTokenFromRequest, getEmailFromJwtPayload } from "../utils/auth";

export const getHome = (request: Request, response: Response): void => {
	const accessToken = getAccessTokenFromRequest(request);
	const userEmail = accessToken ? getEmailFromJwtPayload(accessToken) : null;

	response.render("index", {
		isAuthenticated: Boolean(accessToken),
		userEmail,
	});
};
