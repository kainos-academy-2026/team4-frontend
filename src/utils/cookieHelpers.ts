import type { Response } from "express";

const COOKIE_OPTIONS = {
	httpOnly: true,
	sameSite: "lax" as const,
	maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
};

export const setAccessTokenCookie = (
	response: Response,
	token: string,
): void => {
	response.cookie("access_token", token, COOKIE_OPTIONS);
};

export const clearAccessTokenCookie = (response: Response): void => {
	response.clearCookie("access_token");
};
