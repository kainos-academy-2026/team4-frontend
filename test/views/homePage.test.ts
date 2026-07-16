import path from "node:path";

import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

describe("home page template", () => {
  it("renders the branded home page contract", () => {
    const viewsPath = path.join(process.cwd(), "src/views");
    const environment = nunjucks.configure(viewsPath, {
      autoescape: true,
      noCache: true,
    });

    const html = environment.render("index.njk", {
      isAuthenticated: false,
      userEmail: null,
      jobRoles: [],
      errorMessage: null,
    });

    expect(html).toContain("Welcome to Kainos Careers");
    expect(html).toContain("class=\"kainos-header kainos-header--with-actions\"");
    expect(html).toContain("src=\"/images/kainoslogo.png\"");
    expect(html).toContain("rel=\"icon\"");
    expect(html).toContain("href=\"/images/favicon.png\"");
    expect(html).toContain("href=\"/styles/branding.css\"");
    expect(html).toContain("class=\"kainos-footer\"");
    expect(html).toContain("data-auth-action");
    expect(html).toContain('href="/login"');
    expect(html).toContain("data-auth-greeting");
    expect(html).toContain("You must be logged in to apply for a role.");
    expect(html).not.toContain('Log in here.');
    expect(html).toContain("src=\"/scripts/scroll-reveal.js\"");
    expect(html).toContain("careers@kainosjobs.example");
    expect(html).toContain("+44 28 9000 0000");
    expect(html).toContain("kainos-roles-panel");
    expect(html).toContain("Open Job Roles at Kainos");
  });

  it("renders job roles in the panel when provided", () => {
    const viewsPath = path.join(process.cwd(), "src/views");
    const environment = nunjucks.configure(viewsPath, {
      autoescape: true,
      noCache: true,
    });

    const html = environment.render("index.njk", {
      demoAuthEnabled: false,
      jobRoles: [
        {
          id: 1,
          roleName: "Software Engineer",
          location: "Belfast",
          capability: "Engineering",
          band: "Associate",
          closingDate: new Date("2026-08-01"),
          status: "open",
        },
      ],
      errorMessage: null,
    });

    expect(html).toContain("Software Engineer");
    expect(html).toContain('href="/job-roles/1"');
    expect(html).toContain("Belfast");
  });

  it("renders empty state when no job roles are available", () => {
    const viewsPath = path.join(process.cwd(), "src/views");
    const environment = nunjucks.configure(viewsPath, {
      autoescape: true,
      noCache: true,
    });

    const html = environment.render("index.njk", {
      demoAuthEnabled: false,
      jobRoles: [],
      errorMessage: null,
    });

    expect(html).toContain("No open job roles are available right now.");
  });

  it("renders greeting and logout action when authenticated", () => {
    const viewsPath = path.join(process.cwd(), "src/views");
    const environment = nunjucks.configure(viewsPath, {
      autoescape: true,
      noCache: true,
    });

    const html = environment.render("index.njk", {
      isAuthenticated: true,
      userEmail: "test@example.com",
    });

    expect(html).toContain("Welcome back, test@example.com");
    expect(html).toContain('action="/logout"');
    expect(html).toContain("Log out");
    expect(html).not.toContain('href="/login"');
    expect(html).toContain("Browse open roles");
  });
});