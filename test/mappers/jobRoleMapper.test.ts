import { describe, expect, it } from "vitest";

import {
	mapJobRoleDetailApiToModel,
	mapJobRoleListApiToItem,
	mapJobRoleToListItem,
} from "../../src/mappers/jobRoleMapper";

describe("mapJobRoleDetailApiToModel", () => {
	it("maps API fields into a JobRole", () => {
		const result = mapJobRoleDetailApiToModel({
			id: 1,
			roleName: "Software Engineer",
			location: "Belfast",
			capabilityName: "Engineering",
			capabilityId: 12,
			bandName: "Associate",
			bandId: 3,
			closingDate: new Date("2026-08-01"),
			status: "open",
			description: "Build services",
			responsibilities: "Ship features",
			sharepointUrl: "https://example.com/role/1",
			numberOfOpenPositions: 2,
		});

		expect(result).toEqual({
			id: 1,
			roleName: "Software Engineer",
			location: "Belfast",
			capability: "Engineering",
			band: "Associate",
			closingDate: new Date("2026-08-01"),
			status: "open",
			description: "Build services",
			responsibilities: "Ship features",
			sharepointUrl: "https://example.com/role/1",
			numberOfOpenPositions: 2,
			myApplication: null,
		});
	});

	it("keeps id as a number", () => {
		const result = mapJobRoleDetailApiToModel({
			id: 2,
			roleName: "Data Analyst",
			location: "Gdansk",
			capabilityName: "Data",
			capabilityId: 8,
			bandName: "Senior Associate",
			bandId: 4,
			closingDate: new Date("2026-08-15"),
			status: "open",
			description: "Analyse data",
			responsibilities: "Create reports",
			sharepointUrl: "https://example.com/role/2",
			numberOfOpenPositions: 1,
		});

		expect(result.id).toBe(2);
		expect(result.capability).toBe("Data");
		expect(result.band).toBe("Senior Associate");
	});

	it("maps list API role shape into a list item", () => {
		const result = mapJobRoleListApiToItem({
			id: 3,
			roleName: "QA Engineer",
			location: "Dublin",
			capabilityName: "Quality",
			bandName: "Consultant",
			closingDate: "2026-09-20",
			status: "open",
			myApplication: { status: "in_progress", cvFileName: "cv.pdf" },
		});

		expect(result).toEqual({
			id: 3,
			roleName: "QA Engineer",
			location: "Dublin",
			capability: "Quality",
			band: "Consultant",
			closingDate: new Date("2026-09-20"),
			status: "open",
			myApplication: { status: "in_progress", cvFileName: "cv.pdf" },
		});
	});

	it("maps detail model into list item", () => {
		const result = mapJobRoleToListItem({
			id: 4,
			roleName: "Data Engineer",
			location: "London",
			capability: "Data",
			band: "Associate",
			closingDate: new Date("2026-10-10"),
			status: "open",
			description: "Build pipelines",
			responsibilities: "Design ETL",
			sharepointUrl: "https://example.com/role/4",
			numberOfOpenPositions: 1,
			myApplication: null,
		});

		expect(result).toEqual({
			id: 4,
			roleName: "Data Engineer",
			location: "London",
			capability: "Data",
			band: "Associate",
			closingDate: new Date("2026-10-10"),
			status: "open",
			myApplication: null,
		});
	});
});