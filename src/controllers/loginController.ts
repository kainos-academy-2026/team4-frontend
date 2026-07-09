import type { Request, Response } from "express";

import { isDemoAuthEnabled } from "../config/auth";

export const getLogin = (_req: Request, res: Response): void => {
	res.render("login", {
		demoAuthEnabled: isDemoAuthEnabled(),
	});
};
