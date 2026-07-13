import { z } from "zod";

export const JobRoleSchema = z.object({
	id: z.number(),
	roleName: z.string(),
	location: z.string(),
	capability: z.string(),
	band: z.string(),
	closingDate: z.date(),
	status: z.string(),
	description: z.string(),
	responsibilities: z.string(),
	sharepointUrl: z.string(),
	numberOfOpenPositions: z.number(),
});

export type JobRole = z.infer<typeof JobRoleSchema>;

export const jobRoleIdSchema = z.coerce.number().int().positive();
