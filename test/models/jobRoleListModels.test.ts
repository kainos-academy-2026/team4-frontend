import { describe, expect, it } from "vitest";

import type {
	JobRoleListItem,
	JobRoleListPage,
} from "../../src/models/jobRoleListModels";

describe("jobRole list model types", () => {
	it("supports constructing list page objects with nullable error message", () => {
		const jobRoles: JobRoleListItem[] = [
			{
				id: 1,
				roleName: "Software Engineer",
				location: "Belfast",
				capability: "Engineering",
				band: "Associate",
				closingDate: new Date("2026-08-01"),
				status: "open",
			},
		];

		const page: JobRoleListPage = {
			errorMessage: null,
			jobRoles,
		};

		expect(page.jobRoles[0].roleName).toBe("Software Engineer");
		expect(page.errorMessage).toBeNull();
	});
});
