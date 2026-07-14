import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app";

describe("home branding integration", () => {
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
    expect(response.text).toContain('type="email"');
    expect(response.text).toContain('type="password"');
    expect(response.text).toContain("data-login-error");
    expect(response.text).not.toContain('href="/login">Log in</a>');
  });

  it("serves required static branding assets", async () => {
    const cssResponse = await request(app).get("/styles/branding.css");
    expect(cssResponse.status).toBe(200);
    expect(cssResponse.headers["content-type"]).toContain("text/css");

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