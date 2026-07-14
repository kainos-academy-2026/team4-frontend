import type { Request, Response } from "express";

import { isDemoAuthEnabled } from "../config/auth";

export const getHome = (_request: Request, response: Response): void => {
	response.render("index", {
		demoAuthEnabled: isDemoAuthEnabled(),
	});
};
