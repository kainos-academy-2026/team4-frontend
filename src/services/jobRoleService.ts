import axios, { type AxiosInstance } from "axios";

import apiClient from "../config/apiClient";
import {
	type JobRoleApiResponse,
	type JobRoleListApiResponse,
	mapJobRoleApiResponseToJobRole,
	mapJobRoleApiResponseToJobRoleListItem,
	mapJobRoleToJobRoleListItem,
} from "../mappers/jobRoleMapper";
import { fallbackJobRoles } from "../mocks/jobRoles";
import type { JobRole } from "../models/jobRole";
import type { JobRoleListItemViewModel } from "../models/jobRoleListViewModel";

export class JobRoleService {
	constructor(
		private readonly client: AxiosInstance = apiClient,
		private readonly fallbackData: JobRole[] = fallbackJobRoles,
		private readonly useFallbackMock: boolean = process.env
			.USE_JOB_ROLE_FALLBACK_MOCK !== "false",
	) {}

	async getOpenJobRoles(): Promise<JobRoleListItemViewModel[]> {
		if (this.useFallbackMock) {
			return this.getFallbackOpenJobRoles();
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

			if (this.useFallbackMock) {
				return this.getFallbackOpenJobRoles();
			}

			throw error;
		}
	}

	async getJobRolesById(id: number): Promise<JobRole | null> {
		if (this.useFallbackMock) {
			return this.getFallbackJobRoleById(id);
		}

		try {
			const response = await this.client.get<JobRoleApiResponse>(
				`/job-roles/${id}`,
			);
			return mapJobRoleApiResponseToJobRole(response.data);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				return null;
			}

			if (this.useFallbackMock) {
				return this.getFallbackJobRoleById(id);
			}

			throw error;
		}
	}

	private getFallbackOpenJobRoles(): JobRoleListItemViewModel[] {
		return this.toOpenJobRoles(
			this.fallbackData.map(mapJobRoleToJobRoleListItem),
		);
	}

	private getFallbackJobRoleById(id: number): JobRole | null {
		return this.fallbackData.find((jobRole) => jobRole.id === id) ?? null;
	}

	private toOpenJobRoles(
		jobRoles: JobRoleListItemViewModel[],
	): JobRoleListItemViewModel[] {
		return jobRoles.filter(
			(jobRole) => jobRole.status.toLowerCase() === "open",
		);
	}
}
