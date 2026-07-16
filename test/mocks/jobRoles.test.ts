import { describe, expect, it } from "vitest";

import { fallbackJobRoles } from "../../src/mocks/jobRoles";

describe("fallbackJobRoles", () => {
	it("contains at least one open role", () => {
		expect(fallbackJobRoles.length).toBeGreaterThan(0);
		expect(
			fallbackJobRoles.some((jobRole) => jobRole.status.toLowerCase() === "open"),
		).toBe(true);
	});
});
