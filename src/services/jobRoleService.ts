import axios, { type AxiosInstance } from "axios";

import apiClient from "../config/apiClient";
import {
	type JobRoleApiResponse,
	mapJobRoleApiResponseToJobRole,
} from "../mappers/jobRoleMapper";
import { fallbackJobRoles } from "../mocks/jobRoles";
import type { JobRole } from "../models/jobRole";

export class JobRoleService {
	constructor(
		private readonly client: AxiosInstance = apiClient,
		private readonly fallbackData: JobRole[] = fallbackJobRoles,
		private readonly useFallbackMock: boolean = process.env
			.USE_JOB_ROLE_FALLBACK_MOCK !== "false",
	) {}

	async getOpenJobRoles(): Promise<JobRole[]> {
		if(this.useFallbackMock) {
			return this.toOpenJobRoles(this.fallbackData);
		}

		try {
			const response =
				await this.client.get<JobRoleApiResponse[]>("/job-roles");
			return this.toOpenJobRoles(
				response.data.map(mapJobRoleApiResponseToJobRole),
			);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				return [];
			}
			
			throw error;
		}
	}

	private toOpenJobRoles(jobRoles: JobRole[]): JobRole[] {
		return jobRoles.filter(
			(jobRole) => jobRole.status.toLowerCase() === "open",
		);
	}
}
