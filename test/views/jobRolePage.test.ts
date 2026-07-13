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

		const listHtml = environment.render("job-role-list.njk", {
			jobRoles: [closedRole],
		});
		const detailHtml = environment.render("job-role-detail.njk", {
			jobRole: closedRole,
		});

		expect(listHtml).toContain('class="badge badge--closed"');
		expect(detailHtml).toContain('class="badge badge--closed"');
	});
});