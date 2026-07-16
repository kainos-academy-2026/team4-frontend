import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import app from "../../src/app";
import { LoginService } from "../../src/services/loginService";

describe("POST /login", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("sets cookie and redirects to / on successful login", async () => {
		vi.spyOn(LoginService.prototype, "authenticate").mockResolvedValue("token-123");

		const response = await request(app)
			.post("/login")
			.type("form")
			.send({ email: "test@test.com", password: "passwordtest" });

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/");
		expect(response.headers["set-cookie"]).toEqual(
			expect.arrayContaining([expect.stringContaining("access_token=")]),
		);
	});

	it("renders login with error on failed authentication", async () => {
		vi.spyOn(LoginService.prototype, "authenticate").mockRejectedValue(
			new Error("auth failed"),
		);

		const response = await request(app)
			.post("/login")
			.type("form")
			.send({ email: "test@test.com", password: "wrong" });

		expect(response.status).toBe(401);
		expect(response.text).toContain("Login failed.");
	});
});
