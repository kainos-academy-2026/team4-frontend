import path from "node:path";

import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const createEnvironment = () =>
	nunjucks.configure(path.join(process.cwd(), "src/views"), {
		autoescape: true,
		noCache: true,
	});

describe("home page template", () => {
	it("renders the branded home page contract for logged-out users", () => {
		const html = createEnvironment().render("index.njk", {
			isAuthenticated: false,
			userEmail: null,
			jobRoles: [],
			errorMessage: null,
		});

		expect(html).toContain("Welcome to Kainos Careers");
		expect(html).toContain('class="kainos-header kainos-header--with-actions"');
		expect(html).toContain('src="/images/kainoslogo.png"');
		expect(html).toContain('href="/images/favicon.png"');
		expect(html).toContain('href="/styles/branding.css"');
		expect(html).toContain('src="/images/rocket-hero.png"');
		expect(html).toContain('href="/register"');
		expect(html).toContain('href="/login"');
		expect(html).toContain("You must be logged in to apply for a role.");
		expect(html).toContain('src="/scripts/scroll-reveal.js"');
		expect(html).toContain("Open Job Roles at Kainos");
		expect(html).toContain("No open job roles are available right now.");
		expect(html).not.toContain("Hello world");
		expect(html).not.toContain("data-home-auth-action");
		expect(html).not.toContain("Log in here.");
		expect(html).not.toContain("data-auth-greeting");
		expect(html).toContain("careers@kainosjobs.example");
		expect(html).toContain("+44 28 9000 0000");
	});

	it("renders job roles in the panel when provided", () => {
		const html = createEnvironment().render("index.njk", {
			isAuthenticated: false,
			userEmail: null,
			jobRoles: [
				{
					id: 1,
					roleName: "Software Engineer",
					location: "Belfast",
					capability: "Engineering",
					band: "Associate",
					closingDate: new Date("2026-08-01"),
					status: "Open",
					myApplication: null,
				},
			],
			errorMessage: null,
		});

		expect(html).toContain("Software Engineer");
		expect(html).toContain('href="/job-roles/1"');
		expect(html).toContain("Belfast");
	});

	it("renders an in-progress badge modifier when a role status is In Progress", () => {
		const html = createEnvironment().render("index.njk", {
			isAuthenticated: true,
			userEmail: "test@example.com",
			jobRoles: [
				{
					id: 2,
					roleName: "Product Manager",
					location: "Dublin",
					capability: "Product",
					band: "Manager",
					closingDate: new Date("2026-09-01"),
					status: "In Progress",
					myApplication: { status: "in_progress" },
				},
			],
			errorMessage: null,
		});

		expect(html).toContain('badge--in-progress');
		expect(html).toContain("In Progress");
	});

	it("renders greeting and logout action when authenticated", () => {
		const html = createEnvironment().render("index.njk", {
			isAuthenticated: true,
			userEmail: "test@example.com",
			jobRoles: [],
			errorMessage: null,
		});

		expect(html).toContain("Welcome back, test@example.com");
		expect(html).toContain('action="/logout"');
		expect(html).toContain("Log out");
		expect(html).not.toContain('href="/register"');
		expect(html).not.toContain('href="/login"');
		expect(html).not.toContain("You must be logged in to apply for a role.");
		expect(html).toContain("Browse open roles");
	});

	it("renders an error state when provided", () => {
		const html = createEnvironment().render("index.njk", {
			isAuthenticated: false,
			userEmail: null,
			jobRoles: [],
			errorMessage:
				"Something went wrong loading job roles. Please try again later.",
		});

		expect(html).toContain(
			"Something went wrong loading job roles. Please try again later.",
		);
		expect(html).not.toContain("No open job roles are available right now.");
	});
});
