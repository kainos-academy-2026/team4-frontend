import type { Request, Response } from "express";

import { readAuthSession } from "../auth/session";
import { isDemoAuthEnabled } from "../config/auth";
export const getHome = (req: Request, res: Response): void => {
	const session = readAuthSession(req);

	res.render("index", {
		authEmail: session?.email ?? "",
		demoAuthEnabled: isDemoAuthEnabled(),
		isAuthenticated: Boolean(session),
	});
};
