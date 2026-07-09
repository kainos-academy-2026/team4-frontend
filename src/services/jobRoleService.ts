import axios, { type AxiosInstance } from "axios";

import apiClient from "../config/apiClient";
import { fallbackJobRoles } from "../mocks/jobRoles";
import type { JobRole } from "../models/jobRole";

type JobRoleApiResponse = {
	id: number | string;
	roleName: string;
	location: string;
	capability?: {
		capabilityId: number | string;
		capabilityName: string;
	} | string;
	capabilityId?: number | string;
	band?: {
		bandId: number | string;
		bandName: string;
	} | string;
	bandId?: number | string;
	closingDate: string;
	status: string;
};

export class JobRoleService {
	constructor(
		private readonly client: AxiosInstance = apiClient,
		private readonly fallbackData: JobRole[] = fallbackJobRoles,
		private readonly useFallbackMock: boolean = process.env
			.USE_JOB_ROLE_FALLBACK_MOCK !== "false",
	) {}

	async getOpenJobRoles(): Promise<JobRole[]> {
		try {
			const response = await this.client.get<JobRoleApiResponse[]>("/job-roles");
			return this.toOpenJobRoles(response.data.map((jobRole) => this.toViewModel(jobRole)));
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				return [];
			}

			if (this.useFallbackMock) {
				return this.toOpenJobRoles(this.fallbackData);
			}

			throw error;
		}
	}

	private toOpenJobRoles(jobRoles: JobRole[]): JobRole[] {
		return jobRoles.filter(
			(jobRole) => jobRole.status.toLowerCase() === "open",
		);
	}

	private toViewModel(jobRole: JobRoleApiResponse | JobRole): JobRole {
		const capabilityName = this.getCapabilityName(jobRole);
		const bandName = this.getBandName(jobRole);

		return {
			id: String(jobRole.id),
			roleName: jobRole.roleName,
			location: jobRole.location,
			capability: capabilityName,
			band: bandName,
			closingDate: jobRole.closingDate,
			status: jobRole.status,
		};
	}

	private getCapabilityName(jobRole: JobRoleApiResponse | JobRole): string {
		if (typeof jobRole.capability === "string") {
			return jobRole.capability;
		}

		if (jobRole.capability && typeof jobRole.capability === "object") {
			return jobRole.capability.capabilityName;
		}

		if ("capabilityId" in jobRole && jobRole.capabilityId !== undefined) {
			return `Capability ${jobRole.capabilityId}`;
		}

		return "";
	}

	private getBandName(jobRole: JobRoleApiResponse | JobRole): string {
		if (typeof jobRole.band === "string") {
			return jobRole.band;
		}

		if (jobRole.band && typeof jobRole.band === "object") {
			return jobRole.band.bandName;
		}

		if ("bandId" in jobRole && jobRole.bandId !== undefined) {
			return `Band ${jobRole.bandId}`;
		}

		return "";
	}
}
