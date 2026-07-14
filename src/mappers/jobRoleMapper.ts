import type { JobRole } from "../models/jobRole";
import type { JobRoleListItem } from "../models/jobRoleListModels";

export type JobRoleDetailApi = {
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

export const mapJobRoleDetailApiToModel = (
	jobRoleDetailApi: JobRoleDetailApi,
): JobRole => {
	return {
		id: Number(jobRoleDetailApi.id),
		roleName: jobRoleDetailApi.roleName,
		location: jobRoleDetailApi.location,
		capability: jobRoleDetailApi.capabilityName,
		band: jobRoleDetailApi.bandName,
		closingDate: new Date(jobRoleDetailApi.closingDate),
		status: jobRoleDetailApi.status,
		description: jobRoleDetailApi.description,
		responsibilities: jobRoleDetailApi.responsibilities,
		sharepointUrl: jobRoleDetailApi.sharepointUrl,
		numberOfOpenPositions: jobRoleDetailApi.numberOfOpenPositions,
	};
};

export type JobRoleListApi = {
	id: number;
	roleName: string;
	location: string;
	capabilityName: string;
	bandName: string;
	closingDate: string | Date;
	status: string;
};

export const mapJobRoleListApiToItem = (
	jobRoleListApi: JobRoleListApi,
): JobRoleListItem => {
	return {
		id: jobRoleListApi.id,
		roleName: jobRoleListApi.roleName,
		location: jobRoleListApi.location,
		capability: jobRoleListApi.capabilityName,
		band: jobRoleListApi.bandName,
		closingDate: new Date(jobRoleListApi.closingDate),
		status: jobRoleListApi.status,
	};
};

export const mapJobRoleToListItem = (
	jobRoleDetail: JobRole,
): JobRoleListItem => {
	return {
		id: jobRoleDetail.id,
		roleName: jobRoleDetail.roleName,
		location: jobRoleDetail.location,
		capability: jobRoleDetail.capability,
		band: jobRoleDetail.band,
		closingDate: new Date(jobRoleDetail.closingDate),
		status: jobRoleDetail.status,
	};
};
