import type { JobRole } from "../models/jobRole";

export type JobRoleApiResponse = {
	id: string;
	roleName: string;
	location: string;
	capabilityName: string;
	capabilityId: string;
	bandName: string;
	bandId: string;
	closingDate: Date;
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
