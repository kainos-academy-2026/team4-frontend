import type { NextFunction, Request, Response } from "express";

import {
	getAccessTokenFromRequest,
	getEmailFromJwtPayload,
} from "../utils/auth";

export const setAuthContext = (
	request: Request,
	response: Response,
	next: NextFunction,
): void => {
	const accessToken = getAccessTokenFromRequest(request);
	const userEmail = accessToken ? getEmailFromJwtPayload(accessToken) : null;

	response.locals.isAuthenticated = Boolean(accessToken);
	response.locals.userEmail = userEmail;
	next();
};
