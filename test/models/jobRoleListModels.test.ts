import { describe, expect, it } from "vitest";

import type { JobRoleListItem } from "../../src/models/jobRoleListModels";

describe("jobRole list model types", () => {
	it("supports constructing job role list items", () => {
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

		expect(jobRoles[0].roleName).toBe("Software Engineer");
	});
});

