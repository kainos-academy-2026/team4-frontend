import request from "supertest";
import { describe, expect, it, beforeAll } from "vitest";

import { SignJWT } from "jose";
import app from "../src/app";

const SECRET = new TextEncoder().encode("test-secret-key");

describe("home branding integration", () => {
	let authToken: string;

	beforeAll(async () => {
		authToken = await new SignJWT({ email: "test@example.com" })
			.setProtectedHeader({ alg: "HS256" })
			.sign(SECRET);
	});

  it("serves branded home markup at /", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("class=\"kainos-header kainos-header--with-actions\"");
    expect(response.text).toContain("src=\"/images/kainoslogo.png\"");
    expect(response.text).toContain("href=\"/images/favicon.png\"");
    expect(response.text).toContain("href=\"/styles/branding.css\"");
    expect(response.text).toContain("data-auth-action");
    expect(response.text).toContain('href="/login"');
    expect(response.text).toContain("data-auth-greeting");
    expect(response.text).toContain("You must be logged in to apply for a role.");
    expect(response.text).not.toContain('Log in here.');
    expect(response.text).toContain("careers@kainosjobs.example");
    expect(response.text).toContain("+44 28 9000 0000");
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

    const applicationScriptResponse = await request(app).get("/scripts/job-application.js");
    expect(applicationScriptResponse.status).toBe(200);
    expect(applicationScriptResponse.headers["content-type"]).toContain("javascript");

    const scrollRevealResponse = await request(app).get("/scripts/scroll-reveal.js");
    expect(scrollRevealResponse.status).toBe(200);
    expect(scrollRevealResponse.headers["content-type"]).toContain("javascript");

    const scriptResponse = await request(app).get("/scripts/auth.js");
    expect(scriptResponse.status).toBe(200);
    expect(scriptResponse.headers["content-type"]).toContain("javascript");

    const applicationScriptResponse = await request(app).get("/scripts/job-application.js");
    expect(applicationScriptResponse.status).toBe(200);
    expect(applicationScriptResponse.headers["content-type"]).toContain("javascript");

    const scrollRevealResponse = await request(app).get("/scripts/scroll-reveal.js");
    expect(scrollRevealResponse.status).toBe(200);
    expect(scrollRevealResponse.headers["content-type"]).toContain("javascript");

    const logoResponse = await request(app).get("/images/kainoslogo.png");
    expect(logoResponse.status).toBe(200);
    expect(logoResponse.headers["content-type"]).toContain("image/png");

    const faviconResponse = await request(app).get("/images/favicon.png");
    expect(faviconResponse.status).toBe(200);
    expect(faviconResponse.headers["content-type"]).toContain("image/png");
  });
});