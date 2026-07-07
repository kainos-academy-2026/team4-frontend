import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import app from "../../src/app";
import { JobRoleService, JobRoleServiceError } from "../../src/services/jobRoleService";

describe("GET /job-roles", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders open job roles when service returns data", async () => {
    vi.spyOn(JobRoleService.prototype, "getOpenJobRoles").mockResolvedValue([
      {
        id: "1",
        roleName: "Software Engineer",
        location: "Belfast",
        capability: "Engineering",
        band: "Associate",
        closingDate: "2026-08-01",
        status: "open",
      },
    ]);

    const response = await request(app).get("/job-roles");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Open Job Roles at Kainos");
    expect(response.text).toContain("Software Engineer");
  });

  it("renders empty state when service returns no open roles", async () => {
    vi.spyOn(JobRoleService.prototype, "getOpenJobRoles").mockResolvedValue([]);

    const response = await request(app).get("/job-roles");

    expect(response.status).toBe(200);
    expect(response.text).toContain("No open job roles are available right now.");
  });

  it("renders error state when service throws", async () => {
    vi.spyOn(JobRoleService.prototype, "getOpenJobRoles").mockRejectedValue(
      new JobRoleServiceError("Backend service is currently unavailable.", "BACKEND_ERROR", 503),
    );

    const response = await request(app).get("/job-roles");

    expect(response.status).toBe(502);
    expect(response.text).toContain("Backend service is currently unavailable.");
  });
});