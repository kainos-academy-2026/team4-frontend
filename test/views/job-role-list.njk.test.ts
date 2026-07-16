import path from "node:path";

import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

<<<<<<< HEAD
describe("job-role-list template", () => {
=======
describe("job role list badge rendering", () => {
>>>>>>> e6e9d44 (US024-Front-end-user-reg: Implement user registration functionality f… (#16))
	it("renders closed role badges with closed modifier class", () => {
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

<<<<<<< HEAD
		const listHtml = environment.render("job-role-list.njk", {
			jobRoles: [closedRole],
=======
		const listHtml = environment.render("index.njk", {
			jobRoles: [closedRole],
			errorMessage: null,
>>>>>>> e6e9d44 (US024-Front-end-user-reg: Implement user registration functionality f… (#16))
		});

		expect(listHtml).toContain('class="badge badge--closed"');
	});
});
