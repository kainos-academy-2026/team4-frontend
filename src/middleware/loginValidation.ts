import type { NextFunction, Request, Response } from "express";

import { LoginRequestSchema } from "../dto/loginDto";

export const validateLoginBody = (
	request: Request,
	response: Response,
	next: NextFunction,
): void => {
	const result = LoginRequestSchema.safeParse(request.body);

	if (!result.success) {
		response.status(400).render("login", {
			errorMessage: "Please enter both your email and password.",
		});
		return;
	}

	request.body = result.data;
	next();
};
