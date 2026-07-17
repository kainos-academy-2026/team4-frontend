import request from "supertest";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";

process.env.API_BASE_URL = "http://localhost:4000";

import { JobRoleService } from "../../src/services/jobRoleService";

let app: typeof import("../../src/app").default;

const SECRET = new TextEncoder().encode("test-secret-key");

const createAuthToken = async (): Promise<string> =>
  new SignJWT({ email: "test@example.com", role: "user" })
		.setProtectedHeader({ alg: "HS256" })
    .setSubject("1")
		.sign(SECRET);

describe("GET /job-roles", () => {
  beforeAll(async () => {
    ({ default: app } = await import("../../src/app"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redirects unauthenticated users to login", async () => {
    const response = await request(app).get("/job-roles");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
  });

  it("renders open job roles when service returns data", async () => {
    const token = await createAuthToken();
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

    const response = await request(app)
      .get("/job-roles")
      .set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

    expect(response.status).toBe(200);
    expect(response.text).toContain("Open Job Roles at Kainos");
    expect(response.text).toContain("Software Engineer");
  });

  it("renders empty state when service returns no open roles", async () => {
    const token = await createAuthToken();
    vi.spyOn(JobRoleService.prototype, "getOpenRoles").mockResolvedValue([]);

    const response = await request(app)
      .get("/job-roles")
      .set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

    expect(response.status).toBe(200);
    expect(response.text).toContain("No open job roles are available right now.");
  });

  it("renders error state when service throws", async () => {
    const token = await createAuthToken();
    vi.spyOn(JobRoleService.prototype, "getOpenRoles").mockRejectedValue(
      new Error("Backend service is currently unavailable."),
    );

    const response = await request(app)
      .get("/job-roles")
      .set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

    expect(response.status).toBe(200);
    expect(response.text).toContain("Something went wrong. Please try again later.");
  });
});

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
    });

    const response = await request(app)
      .get("/job-roles/1")
      .set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

    expect(response.status).toBe(200);
    expect(response.text).toContain("Software Engineer");
    expect(response.text).toContain("Build services");
    expect(response.text).toContain("Apply on SharePoint");
  });

  it("renders an invalid id error page", async () => {
    const token = await createAuthToken();
    const response = await request(app)
      .get("/job-roles/not-a-number")
      .set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

    expect(response.status).toBe(200);
    expect(response.text).toContain("Job Role Detail");
    expect(response.text).toContain("Invalid job role id.");
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

  it("renders an error page when the service throws", async () => {
    const token = await createAuthToken();
    vi.spyOn(JobRoleService.prototype, "getRoleById").mockRejectedValue(
      new Error("Backend service is currently unavailable."),
    );

    const response = await request(app)
      .get("/job-roles/1")
      .set("Cookie", [`access_token=${encodeURIComponent(token)}`]);

    expect(response.status).toBe(200);
    expect(response.text).toContain("Something went wrong. Please try again later.");
  });
});

describe("GET /404", () => {
  beforeAll(async () => {
    ({ default: app } = await import("../../src/app"));
  });

  it("renders the dedicated not-found page", async () => {
    const response = await request(app).get("/404");

    expect(response.status).toBe(200);
    expect(response.text).toContain("404");
    expect(response.text).toContain("Page not found");
    expect(response.text).toContain("The page you requested does not exist.");
  });
});