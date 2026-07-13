import type { JobRole } from "../models/jobRole";

export type JobRoleApiResponse = {
	id: number;
	roleName: string;
	location: string;
	capabilityName: string;
	capabilityId: number;
	bandName: string;
	bandId: number;
	closingDate: string;
	status: string;
};

export const mapJobRoleApiResponseToJobRole = (
	jobRole: JobRoleApiResponse,
): JobRole => {
	return {
		id: String(jobRole.id),
		roleName: jobRole.roleName,
		location: jobRole.location,
		capability: jobRole.capabilityName,
		band: jobRole.bandName,
		closingDate: new Date(jobRole.closingDate),
		status: jobRole.status,
	};
};
