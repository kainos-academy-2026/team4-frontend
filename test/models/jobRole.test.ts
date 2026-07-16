import { describe, expect, it } from "vitest";

import { JobRoleSchema, jobRoleIdSchema } from "../../src/models/jobRole";

describe("jobRole model schemas", () => {
	it("validates a complete job role", () => {
		const result = JobRoleSchema.safeParse({
			id: 1,
			roleName: "Software Engineer",
			location: "Belfast",
			capability: "Engineering",
			band: "Associate",
			closingDate: new Date("2026-08-01"),
			status: "open",
			description: "Build systems",
			responsibilities: "Deliver features",
			sharepointUrl: "https://example.com/role/1",
			numberOfOpenPositions: 2,
		});

		expect(result.success).toBe(true);
	});

	it("coerces valid numeric id values and rejects non-positive ids", () => {
		expect(jobRoleIdSchema.parse("3")).toBe(3);
		expect(() => jobRoleIdSchema.parse("0")).toThrow();
	});
});
