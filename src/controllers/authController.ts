import type { Request, Response } from "express";

const renderLogin = (_req: Request, res: Response): void => {
	res.render("login");
};

export const getLogin = renderLogin;

export const postLogin = (_req: Request, res: Response): void => {
	res.redirect("/");
};

export const getLogout = (_req: Request, res: Response): void => {
	res.redirect("/login");
};
