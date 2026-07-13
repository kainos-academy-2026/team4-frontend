import type { JobRole } from "../models/jobRole";
import type { JobRoleListItemViewModel } from "../models/jobRoleListViewModel";

export type JobRoleApiResponse = {
	id: number;
	roleName: string;
	location: string;
	capabilityName: string;
	capabilityId: number;
	bandName: string;
	bandId: number;
	closingDate: Date;
	status: string;
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	numberOfOpenPositions: number;
};

export const mapJobRoleApiResponseToJobRole = (
	jobRole: JobRoleApiResponse,
): JobRole => {

	return {
		id: Number(jobRole.id),
		roleName: jobRole.roleName,
		location: jobRole.location,
		capability: jobRole.capabilityName,
		band: jobRole.bandName,
		closingDate: new Date(jobRole.closingDate),
		status: jobRole.status,
		description: jobRole.description,
		responsibilities: jobRole.responsibilities,
		sharepointUrl: jobRole.sharepointUrl,
		numberOfOpenPositions: jobRole.numberOfOpenPositions,
	};
};

export type JobRoleListApiResponse = {
  id: number;
  roleName: string;
  location: string;
  capabilityName: string;
  bandName: string;
  closingDate: string | Date;
  status: string;
};

export const mapJobRoleApiResponseToJobRoleListItem = (
  jobRole: JobRoleListApiResponse,
): JobRoleListItemViewModel => {
  return {
    roleName: jobRole.roleName,
    location: jobRole.location,
    capability: jobRole.capabilityName,
    band: jobRole.bandName,
    closingDate: new Date(jobRole.closingDate),
    status: jobRole.status,
  };
};