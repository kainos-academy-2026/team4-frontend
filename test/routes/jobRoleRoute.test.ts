import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import app from "../../src/app";
import { JobApplicationService } from "../../src/services/jobApplicationService";
import { JobRoleService } from "../../src/services/jobRoleService";

describe("GET /job-roles/:id", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the job role detail page when the service returns a role", async () => {
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
    });

    const response = await request(app).get("/job-roles/1");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Software Engineer");
    expect(response.text).toContain("Build services");
    expect(response.text).toContain('href="/job-roles/1/apply"');
    expect(response.text).toContain("Apply on SharePoint");
  });

  it("does not render the apply route link when no open positions remain", async () => {
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
      numberOfOpenPositions: 0,
    });

    const response = await request(app).get("/job-roles/1");

    expect(response.status).toBe(200);
    expect(response.text).not.toContain('href="/job-roles/1/apply"');
  });

  it("redirects to not found for an invalid id", async () => {
    const response = await request(app).get("/job-roles/not-a-number");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/404");
  });

  it("redirects to the dedicated not found page when no role exists", async () => {
    vi.spyOn(JobRoleService.prototype, "getRoleById").mockResolvedValue(null);

    const response = await request(app).get("/job-roles/999");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/404");
  });

  it("renders an error page when the service throws", async () => {
    vi.spyOn(JobRoleService.prototype, "getRoleById").mockRejectedValue(
      new Error("Backend service is currently unavailable."),
    );

    const response = await request(app).get("/job-roles/1");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Something went wrong. Please try again later.");
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
    });

    const response = await request(app).get("/job-roles/1/apply");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Apply: Software Engineer");
    expect(response.text).toContain("CV Upload");
    expect(response.text).toContain("Submit application");
  });

  it("renders closed message when role cannot accept applications", async () => {
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

  it("renders an error page when application lookup throws", async () => {
    vi.spyOn(JobRoleService.prototype, "getRoleById").mockRejectedValue(
      new Error("Backend service is currently unavailable."),
    );

    const response = await request(app).get("/job-roles/1/apply");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Something went wrong. Please try again later.");
  });
});

describe("GET /404", () => {
  it("renders the dedicated not-found page", async () => {
    const response = await request(app).get("/404");

    expect(response.status).toBe(200);
    expect(response.text).toContain("404");
    expect(response.text).toContain("Page not found");
    expect(response.text).toContain("The page you requested does not exist.");
  });
});

describe("POST /job-roles/:id/applications", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 404 for an invalid role id", async () => {
    const response = await request(app)
      .post("/job-roles/not-a-number/applications")
      .set("Authorization", "Bearer token")
      .attach("cvFile", Buffer.from("cv"), "cv.pdf");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Job role not found." });
  });

  it("returns 401 when auth header is missing", async () => {
    const response = await request(app)
      .post("/job-roles/1/applications")
      .attach("cvFile", Buffer.from("cv"), "cv.pdf");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Unauthorised." });
  });

  it("returns 400 when cvFile is missing", async () => {
    const response = await request(app)
      .post("/job-roles/1/applications")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "No CV file provided." });
  });

  it("forwards backend success response", async () => {
    vi.spyOn(JobApplicationService.prototype, "submitApplication").mockResolvedValue({
      status: 201,
      data: { id: 10, status: "in_progress" },
    });

    const response = await request(app)
      .post("/job-roles/1/applications")
      .set("Authorization", "Bearer token")
      .attach("cvFile", Buffer.from("cv"), "cv.pdf");

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 10, status: "in_progress" });
  });
});

describe("GET /job-roles/:id/applications/me", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 when auth header is missing", async () => {
    const response = await request(app).get("/job-roles/1/applications/me");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Unauthorised." });
  });

  it("returns current application status", async () => {
    vi.spyOn(JobApplicationService.prototype, "getApplicationStatus").mockResolvedValue({
      id: 10,
      status: "in_progress",
    });

    const response = await request(app)
      .get("/job-roles/1/applications/me")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 10, status: "in_progress" });
  });

  it("maps backend 404 to no application found", async () => {
    vi.spyOn(JobApplicationService.prototype, "getApplicationStatus").mockRejectedValue({
      isAxiosError: true,
      response: { status: 404 },
    });

    const response = await request(app)
      .get("/job-roles/1/applications/me")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "No application found." });
  });
});