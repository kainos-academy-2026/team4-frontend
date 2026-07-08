import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app";

describe("home branding integration", () => {
  it("serves branded home markup at /", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("class=\"kainos-header\"");
    expect(response.text).toContain("Hello World");
    expect(response.text).toContain("class=\"kainos-navbar\"");
    expect(response.text).toContain("href=\"/login\"");
    expect(response.text).toContain("data-auth-signed-out-link");
    expect(response.text).toContain("data-auth-signed-in-state");
    expect(response.text).toContain("data-logout-action");
    expect(response.text).toContain("src=\"/images/kainoslogo.png\"");
    expect(response.text).toContain("href=\"/images/favicon.png\"");
    expect(response.text).toContain("href=\"/styles/branding.css\"");
    expect(response.text).toContain("/scripts/auth-session.js");
    expect(response.text).toContain("class=\"kainos-footer\"");
    expect(response.text).toContain("Contact: support@kainos.com");
    expect(response.text).toContain("Phone: +44 28 9089 0000");
  });

  it("serves the login page at /login", async () => {
    const response = await request(app).get("/login");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("<h1 id=\"login-title\">Log in</h1>");
    expect(response.text).toContain("class=\"kainos-navbar\"");
    expect(response.text).toContain("src=\"/images/kainoslogo.png\"");
    expect(response.text).not.toContain("href=\"/login\"");
    expect(response.text).toContain("data-login-form");
    expect(response.text).toContain("name=\"email\"");
    expect(response.text).toContain("name=\"password\"");
    expect(response.text).toContain("/scripts/auth-session.js");
    expect(response.text).toContain("Contact: support@kainos.com");
    expect(response.text).toContain("Phone: +44 28 9089 0000");
  });

  it("redirects logout visits back to the login page", async () => {
    const response = await request(app).get("/logout");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
  });

  it("serves required static branding assets", async () => {
    const cssResponse = await request(app).get("/styles/branding.css");
    expect(cssResponse.status).toBe(200);
    expect(cssResponse.headers["content-type"]).toContain("text/css");

    const scriptResponse = await request(app).get("/scripts/auth-session.js");
    expect(scriptResponse.status).toBe(200);
    expect(scriptResponse.headers["content-type"]).toContain("javascript");
    expect(scriptResponse.text).toContain("team4_session_token");

    const logoResponse = await request(app).get("/images/kainoslogo.png");
    expect(logoResponse.status).toBe(200);
    expect(logoResponse.headers["content-type"]).toContain("image/png");

    const faviconResponse = await request(app).get("/images/favicon.png");
    expect(faviconResponse.status).toBe(200);
    expect(faviconResponse.headers["content-type"]).toContain("image/png");
  });
});