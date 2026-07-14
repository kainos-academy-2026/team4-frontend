import type { Request, Response } from "express";

import { isDemoAuthEnabled } from "../config/auth";

export const getLogin = (_request: Request, response: Response): void => {
	response.render("login", {
		demoAuthEnabled: isDemoAuthEnabled(),
	});
};
