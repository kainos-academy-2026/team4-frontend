import type { Request, Response } from "express";

export const getHealth = (_request: Request, response: Response): void => {
	response.json({
		status: "UP",
		time: new Date().toISOString(),
	});
};
