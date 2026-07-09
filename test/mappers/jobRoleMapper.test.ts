import { describe, expect, it } from "vitest";

import { mapJobRoleApiResponseToJobRole } from "../../src/mappers/jobRoleMapper";

describe("mapJobRoleApiResponseToJobRole", () => {
	it("maps nested capability and band objects", () => {
		const result = mapJobRoleApiResponseToJobRole({
			id: 1,
			roleName: "Software Engineer",
			location: "Belfast",
			capability: {
				capabilityId: 12,
				capabilityName: "Engineering",
			},
			band: {
				bandId: 3,
				bandName: "Associate",
			},
			closingDate: "2026-08-01",
			status: "open",
		});

		expect(result).toEqual({
			id: "1",
			roleName: "Software Engineer",
			location: "Belfast",
			capability: "Engineering",
			band: "Associate",
			closingDate: "2026-08-01",
			status: "open",
		});
	});

	it("maps string capability and band values", () => {
		const result = mapJobRoleApiResponseToJobRole({
			id: "2",
			roleName: "Data Analyst",
			location: "Gdansk",
			capability: "Data",
			band: "Senior Associate",
			closingDate: "2026-08-15",
			status: "open",
		});

		expect(result.capability).toBe("Data");
		expect(result.band).toBe("Senior Associate");
	});

	it("falls back to id-based labels when names are missing", () => {
		const result = mapJobRoleApiResponseToJobRole({
			id: 3,
			roleName: "QA Engineer",
			location: "Dublin",
			capabilityId: 8,
			bandId: 2,
			closingDate: "2026-08-20",
			status: "open",
		});

		expect(result.capability).toBe("Capability 8");
		expect(result.band).toBe("Band 2");
	});
});