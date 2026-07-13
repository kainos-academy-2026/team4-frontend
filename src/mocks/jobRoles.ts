import type { JobRole } from "../models/jobRole";

export const fallbackJobRoles: JobRole[] = [
	{
		id: 1,
		roleName: "Software Engineer",
		location: "Belfast",
		capability: "Engineering",
		band: "Associate",
		closingDate: new Date("2026-08-01"),
		status: "open",
	},
	{
		id: 2,
		roleName: "Test Engineer",
		location: "Dublin",
		capability: "Quality Engineering",
		band: "Senior Associate",
		closingDate: new Date("2026-08-12"),
		status: "open",
	},
	{
		id: 3,
		roleName: "Data Analyst",
		location: "Gdansk",
		capability: "Data",
		band: "Associate",
		closingDate: new Date("2026-07-15"),
		status: "closed",
	},
];
