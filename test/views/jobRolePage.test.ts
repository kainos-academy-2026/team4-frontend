import path from "node:path";

import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

describe("job role page templates", () => {
	it("renders closed badges with the closed modifier class", () => {
		const viewsPath = path.join(process.cwd(), "src/views");
		const environment = nunjucks.configure(viewsPath, {
			autoescape: true,
			noCache: true,
		});

		const closedRole = {
			id: 3,
			roleName: "Data Analyst",
			location: "Gdansk",
			capability: "Data",
			band: "Associate",
			closingDate: new Date("2026-07-15"),
			status: "closed",
			description: "Analyse operational and product datasets.",
			responsibilities: "Create dashboards and report insights.",
			sharepointUrl: "https://example.com/roles/data-analyst",
			numberOfOpenPositions: 0,
		};

		const detailHtml = environment.render("job-role-detail.njk", {
			jobRole: closedRole,
		});

		expect(detailHtml).toContain('class="badge badge--closed"');
		expect(detailHtml).not.toContain('Log in here.');
		expect(detailHtml).toContain('href="/#roles"');
	});

	it("renders the apply CTA only when role is open and has open positions", () => {
		const viewsPath = path.join(process.cwd(), "src/views");
		const environment = nunjucks.configure(viewsPath, {
			autoescape: true,
			noCache: true,
		});

		const openRole = {
			id: 5,
			roleName: "Frontend Engineer",
			location: "Belfast",
			capability: "Engineering",
			band: "Associate",
			closingDate: new Date("2026-07-30"),
			status: "open",
			description: "Build UI experiences.",
			responsibilities: "Deliver frontend features.",
			sharepointUrl: "https://example.com/roles/frontend-engineer",
			numberOfOpenPositions: 1,
		};

		const htmlWithApply = environment.render("job-role-detail.njk", {
			jobRole: openRole,
			showApplyForRole: true,
			isLoggedIn: true,
		});

		const htmlWithApplyLoggedOut = environment.render("job-role-detail.njk", {
			jobRole: openRole,
			showApplyForRole: true,
			isLoggedIn: false,
		});

		const htmlWithoutApply = environment.render("job-role-detail.njk", {
			jobRole: {
				...openRole,
				numberOfOpenPositions: 0,
			},
			showApplyForRole: false,
		});

		const applicationHtml = environment.render("job-role-application.njk", {
			jobRole: openRole,
			canApply: true,
			errorMessage: null,
		});

		expect(htmlWithApply).toContain('href="/job-roles/5/apply"');
		expect(htmlWithApply).not.toContain('kainos-primary-action--disabled');
		expect(htmlWithApply).not.toContain('aria-disabled="true"');

		expect(htmlWithApplyLoggedOut).toContain('href="/job-roles/5/apply"');
		expect(htmlWithApplyLoggedOut).toContain('kainos-primary-action--disabled');
		expect(htmlWithApplyLoggedOut).toContain('aria-disabled="true"');
		expect(htmlWithApplyLoggedOut).toContain('tabindex="-1"');

		expect(htmlWithoutApply).not.toContain('href="/job-roles/5/apply"');
		expect(applicationHtml).not.toContain('Log in here.');
		expect(applicationHtml).toContain('href="/#roles"');
	});

	it("renders the job application page contract", () => {
		const viewsPath = path.join(process.cwd(), "src/views");
		const environment = nunjucks.configure(viewsPath, {
			autoescape: true,
			noCache: true,
		});

		const html = environment.render("job-role-application.njk", {
			jobRole: {
				id: 2,
				roleName: "Data Engineer",
				location: "Dublin",
				capability: "Data",
				band: "Senior Associate",
				closingDate: new Date("2026-08-10"),
				status: "open",
				description: "Build data pipelines.",
				responsibilities: "Deliver data products.",
				sharepointUrl: "https://example.com/roles/data-engineer",
				numberOfOpenPositions: 2,
			},
			canApply: true,
			errorMessage: null,
		});

		expect(html).toContain("Apply: Data Engineer");
		expect(html).toContain("data-job-application-form");
		expect(html).toContain('method="post"');
		expect(html).toContain('action="/job-roles/2/apply"');
		expect(html).toContain('type="file"');
		expect(html).toContain("data-application-confirmation");
		expect(html).not.toContain('Log in here.');
		expect(html).toContain('href="/#roles"');
	});

	it("renders the job application page contract", () => {
		const viewsPath = path.join(process.cwd(), "src/views");
		const environment = nunjucks.configure(viewsPath, {
			autoescape: true,
			noCache: true,
		});

		const html = environment.render("job-role-application.njk", {
			jobRole: {
				id: 2,
				roleName: "Data Engineer",
				location: "Dublin",
				capability: "Data",
				band: "Senior Associate",
				closingDate: new Date("2026-08-10"),
				status: "open",
				description: "Build data pipelines.",
				responsibilities: "Deliver data products.",
				sharepointUrl: "https://example.com/roles/data-engineer",
				numberOfOpenPositions: 2,
			},
			canApply: true,
			errorMessage: null,
		});

		expect(html).toContain("Apply: Data Engineer");
		expect(html).toContain("data-job-application-form");
		expect(html).toContain('method="post"');
		expect(html).toContain('action="/job-roles/2/apply"');
		expect(html).toContain('type="file"');
		expect(html).toContain("data-application-confirmation");
	});
});