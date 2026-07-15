import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const registerUserSchema = z
	.object({
		email: z.string().trim().email(),
		password: z
			.string()
			.min(8)
			.regex(/[A-Z]/)
			.regex(/[a-z]/)
			.regex(/[^A-Za-z0-9]/),
	})
	.strict();

export const validateRegisterUser = (
	request: Request,
	response: Response,
	next: NextFunction,
): void => {
	const parsedBody = registerUserSchema.safeParse(request.body);

	if (!parsedBody.success) {
		response.status(400).json({ message: "Invalid registration payload" });
		return;
	}

	request.body = parsedBody.data;
	next();
};
