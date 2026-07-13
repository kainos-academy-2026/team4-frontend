import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import app from "../../src/app";
import { DEMO_AUTH_FEATURE_FLAG } from "../../src/config/auth";
import { createDemoToken } from "../../src/auth/session";

describe("auth routes", () => {
	afterEach(() => {
		delete process.env[DEMO_AUTH_FEATURE_FLAG];
		vi.restoreAllMocks();
	});

	it("returns 401 for unauthenticated health checks", async () => {
		const response = await request(app).get("/health");

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Authentication required." });
	});

	it("allows authenticated health checks", async () => {
		const response = await request(app)
			.get("/health")
			.set("Cookie", [
				`demoAuthToken=${createDemoToken("test@test.com", "applicant")}`,
			]);

		expect(response.status).toBe(200);
		expect(response.body.status).toBe("UP");
	});

	it("logs in an applicant and returns a jwt for browser session storage", async () => {
		process.env[DEMO_AUTH_FEATURE_FLAG] = "true";

		const response = await request(app).post("/login").send({
			email: "test@test.com",
			password: "passwordtest",
		});

		expect(response.status).toBe(200);
		expect(response.body.email).toBe("test@test.com");
		expect(response.body.role).toBe("applicant");
		expect(response.body.token).toContain(".");
		expect(response.headers["set-cookie"]?.[0]).toContain("demoAuthToken=");
	});

	it("logs out and clears the auth cookie", async () => {
		const response = await request(app).post("/logout");

		expect(response.status).toBe(204);
		expect(response.headers["set-cookie"]?.[0]).toContain("demoAuthToken=");
	});
});