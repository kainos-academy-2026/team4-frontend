import type { Request, Response } from "express";

export const getHome = (_request: Request, response: Response): void => {
	const isAuthenticated = !!response.locals.user;
	const userEmail = response.locals.user?.email || null;

	response.render("index", {
		isAuthenticated,
		userEmail,
	});
};
