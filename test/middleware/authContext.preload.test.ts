import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

describe("setAuthContext preload behavior", () => {
	it("continues safely when jose preload import fails", async () => {
		vi.resetModules();
		vi.doMock("jose", () => {
			throw new Error("mocked import failure");
		});

		const { setAuthContext } = await import("../../src/middleware/authContext");
		const next = vi.fn() as unknown as NextFunction;
		const response = { locals: {} } as Response;

		setAuthContext(
			{ cookies: { access_token: "token-value" } } as Request,
			response,
			next,
		);

		expect(response.locals).toEqual({
			isAuthenticated: true,
			userEmail: null,
		});
		expect(next).toHaveBeenCalledOnce();

		vi.doUnmock("jose");
	});
});
