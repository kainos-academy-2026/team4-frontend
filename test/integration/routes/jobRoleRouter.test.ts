import request from "supertest";
import { SignJWT } from "jose";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { JobApplicationService } from "../../../src/services/jobApplicationService";
import { JobRoleService } from "../../../src/services/jobRoleService";

process.env.API_BASE_URL = "http://localhost:4000";

let app: typeof import("../../../src/app").default;

const SECRET = new TextEncoder().encode("test-secret-key");

const createAuthToken = async (): Promise<string> =>
	new SignJWT({ email: "test@example.com", role: "user" })
		.setProtectedHeader({ alg: "HS256" })
		.setSubject("1")
		.sign(SECRET);

describe("GET /job-roles/:id", () => {
	beforeAll(async () => {
		({ default: app } = await import("../../../src/app"));
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("renders the job role detail page for unauthenticated users", async () => {
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

		const response = await request(app).get("/job-roles/1");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("Build services");
		expect(response.text).toContain(
			"You must",
		);
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

	it("redirects unauthenticated users to login", async () => {
		const response = await request(app).get("/job-roles/1/apply");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
	});

	it("renders the application page when the role can accept applications", async () => {
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
			.get("/job-roles/1/apply")
			.set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

		expect(response.status).toBe(200);
		expect(response.text).toContain("Apply: Software Engineer");
		expect(response.text).toContain("CV Upload");
		expect(response.text).toContain("Submit application");
	});

	it("renders a closed message when applications cannot be accepted", async () => {
		const token = await createAuthToken();
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

		const response = await request(app)
			.get("/job-roles/1/apply")
			.set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

		expect(response.status).toBe(200);
		expect(response.text).toContain("Applications are closed for this role.");
		expect(response.text).not.toContain("Submit application");
	});

	it("redirects to not found for an invalid id", async () => {
		const token = await createAuthToken();
		const response = await request(app)
			.get("/job-roles/not-a-number/apply")
			.set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/404");
	});

	it("redirects to not found when no role exists", async () => {
		const token = await createAuthToken();
		vi.spyOn(JobRoleService.prototype, "getRoleById").mockResolvedValue(null);

		const response = await request(app)
			.get("/job-roles/999/apply")
			.set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/404");
	});
});

describe("GET /job-roles/:id/applications/upload-url", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("redirects unauthenticated users to login", async () => {
		const response = await request(app).get(
			"/job-roles/1/applications/upload-url",
		);

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Unauthorised." });
	});

	it("returns 400 when the job role id is invalid", async () => {
		const token = await createAuthToken();

		const response = await request(app)
			.get("/job-roles/not-a-number/applications/upload-url")
			.set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

		expect(response.status).toBe(400);
		expect(response.body).toEqual({ message: "Invalid job role ID." });
	});

	it("returns upload URL payload when the request is valid", async () => {
		const token = await createAuthToken();
		vi.spyOn(JobApplicationService.prototype, "getUploadUrl").mockResolvedValue({
			presignedUrl: "https://uploads.example.com/presigned",
			s3Key: "applications/1/cv.pdf",
		});

		const response = await request(app)
			.get("/job-roles/1/applications/upload-url")
			.query({ fileName: "cv.pdf", mimeType: "application/pdf" })
			.set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			presignedUrl: "https://uploads.example.com/presigned",
			s3Key: "applications/1/cv.pdf",
		});
		expect(JobApplicationService.prototype.getUploadUrl).toHaveBeenCalledWith(
			1,
			expect.stringMatching(/^Bearer\s.+/),
			"cv.pdf",
			"application/pdf",
		);
	});

	it("maps backend not found to 404", async () => {
		const token = await createAuthToken();
		vi.spyOn(JobApplicationService.prototype, "getUploadUrl").mockRejectedValue({
			isAxiosError: true,
			response: { status: 404, data: {} },
		});

		const response = await request(app)
			.get("/job-roles/1/applications/upload-url")
			.set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

		expect(response.status).toBe(404);
		expect(response.body).toEqual({ message: "Job role not found." });
	});
});

describe("POST /job-roles/:id/applications", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns 401 when the user is unauthenticated", async () => {
		const response = await request(app).post("/job-roles/1/applications").send({
			s3Key: "applications/1/cv.pdf",
			cvFileName: "cv.pdf",
			cvMimeType: "application/pdf",
			cvSizeBytes: 12345,
		});

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Unauthorised." });
	});

	it("returns 400 when upload fields are missing", async () => {
		const token = await createAuthToken();

		const response = await request(app)
			.post("/job-roles/1/applications")
			.set("Cookie", [`access_token=${encodeURIComponent(token)}`])
			.send({ cvFileName: "cv.pdf" });

		expect(response.status).toBe(400);
		expect(response.body).toEqual({ message: "Missing required upload fields." });
	});

	it("returns backend response when application is submitted", async () => {
		const token = await createAuthToken();
		vi.spyOn(JobApplicationService.prototype, "submitApplication").mockResolvedValue({
			status: 201,
			data: { id: "app-1", status: "in_progress" },
		});

		const response = await request(app)
			.post("/job-roles/1/applications")
			.set("Cookie", [`access_token=${encodeURIComponent(token)}`])
			.send({
				s3Key: "applications/1/cv.pdf",
				cvFileName: "cv.pdf",
				cvMimeType: "application/pdf",
				cvSizeBytes: 12345,
			});

		expect(response.status).toBe(201);
		expect(response.body).toEqual({ id: "app-1", status: "in_progress" });
		expect(JobApplicationService.prototype.submitApplication).toHaveBeenCalledWith(
			1,
			expect.stringMatching(/^Bearer\s.+/),
			{
				s3Key: "applications/1/cv.pdf",
				cvFileName: "cv.pdf",
				cvMimeType: "application/pdf",
				cvSizeBytes: 12345,
			},
		);
	});

	it("forwards backend error responses", async () => {
		const token = await createAuthToken();
		vi.spyOn(JobApplicationService.prototype, "submitApplication").mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 409,
				data: { message: "Application already exists." },
			},
		});

		const response = await request(app)
			.post("/job-roles/1/applications")
			.set("Cookie", [`access_token=${encodeURIComponent(token)}`])
			.send({
				s3Key: "applications/1/cv.pdf",
				cvFileName: "cv.pdf",
				cvMimeType: "application/pdf",
				cvSizeBytes: 12345,
			});

		expect(response.status).toBe(409);
		expect(response.body).toEqual({ message: "Application already exists." });
	});
});