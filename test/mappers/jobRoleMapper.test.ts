import { describe, expect, it } from "vitest";

import { mapJobRoleApiResponseToJobRole } from "../../src/mappers/jobRoleMapper";

describe("mapJobRoleApiResponseToJobRole", () => {
	it("maps strict capabilityName and bandName fields", () => {
		const result = mapJobRoleApiResponseToJobRole({
			id: 1,
			roleName: "Software Engineer",
			location: "Belfast",
			capabilityName: "Engineering",
			capabilityId: 12,
			bandName: "Associate",
			bandId: 3,
			closingDate: "2026-08-01",
			status: "open",
		});

		expect(result).toEqual({
			id: "1",
			roleName: "Software Engineer",
			location: "Belfast",
			capability: "Engineering",
			band: "Associate",
			closingDate: new Date("2026-08-01"),
			status: "open",
		});
	});
});