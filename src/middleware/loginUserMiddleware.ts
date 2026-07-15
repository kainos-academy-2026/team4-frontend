import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const loginUserSchema = z
	.object({
		email: z.string().trim().email(),
		password: z.string().min(1),
	})
	.strict();

export const validateLoginUser = (
	request: Request,
	response: Response,
	next: NextFunction,
): void => {
	const parsedBody = loginUserSchema.safeParse(request.body);

	if (!parsedBody.success) {
		response.status(400).json({ message: "Invalid login payload" });
		return;
	}

	request.body = parsedBody.data;
	next();
};
