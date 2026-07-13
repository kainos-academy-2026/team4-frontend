import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import app from "../../src/app";
import { JobRoleService } from "../../src/services/jobRoleService";

describe("GET /job-roles", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders open job roles when service returns data", async () => {
    vi.spyOn(JobRoleService.prototype, "getOpenRoles").mockResolvedValue([
      {
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
      },
    ]);

    const response = await request(app).get("/job-roles");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Open Job Roles at Kainos");
    expect(response.text).toContain("Software Engineer");
  });

  it("renders empty state when service returns no open roles", async () => {
    vi.spyOn(JobRoleService.prototype, "getOpenRoles").mockResolvedValue([]);

    const response = await request(app).get("/job-roles");

    expect(response.status).toBe(200);
    expect(response.text).toContain("No open job roles are available right now.");
  });

  it("renders error state when service throws", async () => {
    vi.spyOn(JobRoleService.prototype, "getOpenRoles").mockRejectedValue(
      new Error("Backend service is currently unavailable."),
    );

    const response = await request(app).get("/job-roles");

    expect(response.status).toBe(502);
    expect(response.text).toContain("Something went wrong. Please try again later.");
  });
});

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
    expect(response.text).toContain("Apply on SharePoint");
  });

  it("renders an invalid id error page", async () => {
    const response = await request(app).get("/job-roles/not-a-number");

    expect(response.status).toBe(400);
    expect(response.text).toContain("Job Role Detail");
    expect(response.text).toContain("Invalid job role id.");
  });

  it("renders a not found error page when no role exists", async () => {
    vi.spyOn(JobRoleService.prototype, "getRoleById").mockResolvedValue(null);

    const response = await request(app).get("/job-roles/999");

    expect(response.status).toBe(404);
    expect(response.text).toContain("Job role not found.");
  });

  it("renders an error page when the service throws", async () => {
    vi.spyOn(JobRoleService.prototype, "getRoleById").mockRejectedValue(
      new Error("Backend service is currently unavailable."),
    );

    const response = await request(app).get("/job-roles/1");

    expect(response.status).toBe(502);
    expect(response.text).toContain("Something went wrong. Please try again later.");
  });
});