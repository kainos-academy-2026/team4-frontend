import request from "supertest";
import { describe, expect, it, beforeAll } from "vitest";

import { SignJWT } from "jose";

process.env.API_BASE_URL = "http://localhost:4000";

let app: typeof import("../../src/app").default;

const SECRET = new TextEncoder().encode("test-secret-key");

describe("home branding integration", () => {
	let authToken: string;

	beforeAll(async () => {
    ({ default: app } = await import("../../src/app"));

		authToken = await new SignJWT({
			email: "test@example.com",
			role: "applicant",
		})
			.setProtectedHeader({ alg: "HS256" })
			.sign(SECRET);
	});

  it("serves branded home markup at /", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
  });

  it("serves branded login markup at /login", async () => {
    const response = await request(app).get("/login");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("src=\"/images/kainoslogo.png\"");
    expect(response.text).toContain("href=\"/styles/branding.css\"");
    expect(response.text).toContain('href="/">Home</a>');
    expect(response.text).toContain("data-login-form");
    expect(response.text).toContain('method="post"');
    expect(response.text).toContain('action="/login"');
    expect(response.text).toContain('type="email"');
    expect(response.text).toContain('type="password"');
    expect(response.text).toContain("data-login-error");
    expect(response.text).not.toContain('href="/login">Log in</a>');
    expect(response.text).not.toContain("/scripts/auth.js");
  });

  it("renders logged-in home state when access_token cookie is present", async () => {
    const response = await request(app)
      .get("/")
      .set("Cookie", [`access_token=${encodeURIComponent(authToken)}`]);

    expect(response.status).toBe(200);
    expect(response.text).toContain("Welcome back, test@example.com");
    expect(response.text).toContain('action="/logout"');
    expect(response.text).toContain("Log out");
    expect(response.text).not.toContain('href="/login"');
  });

  it("serves required static branding assets", async () => {
    const cssResponse = await request(app).get("/styles/branding.css");
    expect(cssResponse.status).toBe(200);
    expect(cssResponse.headers["content-type"]).toContain("text/css");

    const logoResponse = await request(app).get("/images/kainoslogo.png");
    expect(logoResponse.status).toBe(200);
    expect(logoResponse.headers["content-type"]).toContain("image/png");

    const faviconResponse = await request(app).get("/images/favicon.png");
    expect(faviconResponse.status).toBe(200);
    expect(faviconResponse.headers["content-type"]).toContain("image/png");
  });
});