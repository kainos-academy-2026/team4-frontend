import axios, { type AxiosInstance } from "axios";

import apiClient from "../config/apiClient";
import {
	type JobRoleListApiResponse,
	mapJobRoleApiResponseToJobRoleListItem,
} from "../mappers/jobRoleMapper";
import { fallbackJobRoles } from "../mocks/jobRoles";
import type { JobRoleListItemViewModel } from "../models/jobRoleListViewModel";

export class JobRoleService {
	constructor(
		private readonly client: AxiosInstance = apiClient,
		private readonly fallbackData: JobRoleListItemViewModel[] = fallbackJobRoles,
		private readonly useFallbackMock: boolean = process.env
			.USE_JOB_ROLE_FALLBACK_MOCK !== "false",
	) {}

	async getOpenJobRoles(): Promise<JobRoleListItemViewModel[]> {
		if(this.useFallbackMock) {
			return this.toOpenJobRoles(this.fallbackData);
		}

		try {
			const response =
				await this.client.get<JobRoleListApiResponse[]>("/job-roles");
			return this.toOpenJobRoles(
				response.data.map(mapJobRoleApiResponseToJobRoleListItem),
			);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				return [];
			}
			
			throw error;
		}
	}

	private toOpenJobRoles(jobRoles: JobRoleListItemViewModel[]): JobRoleListItemViewModel[] {
		return jobRoles.filter(
			(jobRole) => jobRole.status.toLowerCase() === "open",
		);
	}
}
