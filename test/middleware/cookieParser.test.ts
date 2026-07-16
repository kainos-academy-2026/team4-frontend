import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import cookieParserMiddleware from "../../src/middleware/cookieParser";

describe("cookieParser middleware", () => {
	it("is a callable middleware function", () => {
		expect(typeof cookieParserMiddleware).toBe("function");
	});

	it("parses cookie header into req.cookies", () => {
		const next = vi.fn() as unknown as NextFunction;
		const request = {
			headers: {
				cookie: "access_token=test-token; theme=light",
			},
		} as unknown as Request;

		cookieParserMiddleware(request, {} as Response, next);

		expect(request.cookies).toEqual({
			access_token: "test-token",
			theme: "light",
		});
		expect(next).toHaveBeenCalledOnce();
	});
});
