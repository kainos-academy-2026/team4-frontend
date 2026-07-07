import type { Request, Response } from "express";

export const getHome = (_req: Request, res: Response): void => {
	res.render("index");
};
