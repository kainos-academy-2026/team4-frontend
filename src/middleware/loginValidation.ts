import type { NextFunction, Request, Response } from "express";

import type { ZodSchema } from "zod";

export const validateBody =
	(schema: ZodSchema) =>
	(request: Request, response: Response, next: NextFunction): void => {
		const result = schema.safeParse(request.body);

		if (!result.success) {
			response.locals.errors = result.error;
			next();
			return;
		}

		request.body = result.data;
		next();
	};
