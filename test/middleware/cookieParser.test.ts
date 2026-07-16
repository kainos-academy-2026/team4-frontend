import { describe, expect, it } from "vitest";

import cookieParserMiddleware from "../../src/middleware/cookieParser";

describe("cookieParser middleware", () => {
	it("exports a cookie-parser middleware function", () => {
		expect(typeof cookieParserMiddleware).toBe("function");
	});
});
