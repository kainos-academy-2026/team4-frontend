import request from "supertest";
import { SignJWT } from "jose";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { JobRoleService } from "../../src/services/jobRoleService";

process.env.API_BASE_URL = "http://localhost:4000";

let app: typeof import("../../src/app").default;

const SECRET = new TextEncoder().encode("test-secret-key");

const createAuthToken = async (): Promise<string> =>
	new SignJWT({ email: "test@example.com", role: "user" })
		.setProtectedHeader({ alg: "HS256" })
		.setSubject("1")
		.sign(SECRET);

describe("GET /job-roles/:id", () => {
	beforeAll(async () => {
		({ default: app } = await import("../../src/app"));
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("redirects unauthenticated users to login", async () => {
		const response = await request(app).get("/job-roles/1");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
	});

	it("renders the job role detail page when the service returns a role", async () => {
		const token = await createAuthToken();
		vi.spyOn(JobRoleService.prototype, "getRoleById").mockResolvedValue({
			id: 1,
			roleName: "Software Engineer",
			location: "Belfast",
			capability: "Engineering",
			band: "Associate",
			closingDate: new Date("2026-08-01"),
			status: "open",
			description: "Build services",
			responsibilities: "Ship features",
			sharepointUrl: "https://example.com/role/1",
			numberOfOpenPositions: 2,
			myApplication: null,
		});

		const response = await request(app)
			.get("/job-roles/1")
			.set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

		expect(response.status).toBe(200);
		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("Build services");
		expect(response.text).toContain('href="/job-roles/1/apply"');
		expect(response.text).toContain("Apply on SharePoint");
	});

	it("redirects to not found for an invalid id", async () => {
		const token = await createAuthToken();
		const response = await request(app)
			.get("/job-roles/not-a-number")
			.set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/404");
	});

	it("redirects to the dedicated not found page when no role exists", async () => {
		const token = await createAuthToken();
		vi.spyOn(JobRoleService.prototype, "getRoleById").mockResolvedValue(null);

		const response = await request(app)
			.get("/job-roles/999")
			.set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/404");
	});

	it("renders an error state when the service throws", async () => {
		const token = await createAuthToken();
		vi.spyOn(JobRoleService.prototype, "getRoleById").mockRejectedValue(
			new Error("Backend service is currently unavailable."),
		);

		const response = await request(app)
			.get("/job-roles/1")
			.set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			"Something went wrong. Please try again later.",
		);
	});
});

describe("GET /job-roles/:id/apply", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("renders the application page when the role can accept applications", async () => {
		vi.spyOn(JobRoleService.prototype, "getRoleById").mockResolvedValue({
			id: 1,
			roleName: "Software Engineer",
			location: "Belfast",
			capability: "Engineering",
			band: "Associate",
			closingDate: new Date("2026-08-01"),
			status: "open",
			description: "Build services",
			responsibilities: "Ship features",
			sharepointUrl: "https://example.com/role/1",
			numberOfOpenPositions: 2,
			myApplication: null,
		});

		const response = await request(app).get("/job-roles/1/apply");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Apply: Software Engineer");
		expect(response.text).toContain("CV Upload");
		expect(response.text).toContain("Submit application");
	});

	it("renders a closed message when applications cannot be accepted", async () => {
		vi.spyOn(JobRoleService.prototype, "getRoleById").mockResolvedValue({
			id: 1,
			roleName: "Software Engineer",
			location: "Belfast",
			capability: "Engineering",
			band: "Associate",
			closingDate: new Date("2026-08-01"),
			status: "closed",
			description: "Build services",
			responsibilities: "Ship features",
			sharepointUrl: "https://example.com/role/1",
			numberOfOpenPositions: 2,
			myApplication: null,
		});

		const response = await request(app).get("/job-roles/1/apply");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Applications are closed for this role.");
		expect(response.text).not.toContain("Submit application");
	});

	it("redirects to not found for an invalid id", async () => {
		const response = await request(app).get("/job-roles/not-a-number/apply");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/404");
	});

	it("redirects to not found when no role exists", async () => {
		vi.spyOn(JobRoleService.prototype, "getRoleById").mockResolvedValue(null);

		const response = await request(app).get("/job-roles/999/apply");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/404");
	});
});
