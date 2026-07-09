import type { JobRole } from "../models/jobRole";

export type JobRoleApiResponse = {
	id: number | string;
	roleName: string;
	location: string;
	capability?:
		| {
				capabilityId: number | string;
				capabilityName: string;
		  }
		| string;
	capabilityId?: number | string;
	band?:
		| {
				bandId: number | string;
				bandName: string;
		  }
		| string;
	bandId?: number | string;
	closingDate: string;
	status: string;
};

export const mapJobRoleApiResponseToJobRole = (
	jobRole: JobRoleApiResponse,
): JobRole => {
	const capabilityName = getCapabilityName(jobRole);
	const bandName = getBandName(jobRole);

	return {
		id: String(jobRole.id),
		roleName: jobRole.roleName,
		location: jobRole.location,
		capability: capabilityName,
		band: bandName,
		closingDate: jobRole.closingDate,
		status: jobRole.status,
	};
};

const getCapabilityName = (jobRole: JobRoleApiResponse): string => {
	if (typeof jobRole.capability === "string") {
		return jobRole.capability;
	}

	if (jobRole.capability && typeof jobRole.capability === "object") {
		return jobRole.capability.capabilityName;
	}

	if (jobRole.capabilityId !== undefined) {
		return `Capability ${jobRole.capabilityId}`;
	}

	return "";
};

const getBandName = (jobRole: JobRoleApiResponse): string => {
	if (typeof jobRole.band === "string") {
		return jobRole.band;
	}

	if (jobRole.band && typeof jobRole.band === "object") {
		return jobRole.band.bandName;
	}

	if (jobRole.bandId !== undefined) {
		return `Band ${jobRole.bandId}`;
	}

	return "";
};
