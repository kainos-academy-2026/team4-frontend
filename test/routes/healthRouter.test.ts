import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import app from "../../src/app";

describe("GET /health", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns health payload with status and ISO timestamp", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-07-23T10:00:00.000Z"));

		const response = await request(app).get("/health");

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			status: "UP",
			time: "2026-07-23T10:00:00.000Z",
		});
	});
});
