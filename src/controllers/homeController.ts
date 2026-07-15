import type { Request, Response } from "express";

export const getHome = (_request: Request, response: Response): void => {
	const { isAuthenticated, userEmail } = response.locals;

	response.render("index", {
		isAuthenticated,
		userEmail,
	});
};
