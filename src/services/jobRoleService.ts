import axios, { type AxiosInstance } from "axios";

import apiClient from "../config/apiClient";
import {
	type JobRoleDetailApi,
	type JobRoleListApi,
	mapJobRoleDetailApiToModel,
	mapJobRoleListApiToItem,
	mapJobRoleToListItem,
} from "../mappers/jobRoleMapper";
import { fallbackJobRoles } from "../mocks/jobRoles";
import type { JobRole } from "../models/jobRole";
import type { JobRoleListItem } from "../models/jobRoleListModels";

export class JobRoleService {
	constructor(
		private readonly client: AxiosInstance = apiClient,
		private readonly fallbackData: JobRole[] = fallbackJobRoles,
		private readonly useFallbackMock: boolean = process.env
			.USE_JOB_ROLE_FALLBACK_MOCK === "true",
	) {}

	async getOpenRoles(authHeader?: string): Promise<JobRoleListItem[]> {
		if (this.useFallbackMock) {
			return this.getFallbackOpenRoles();
		}

		try {
			const jobRoleListResponse = authHeader
				? await this.client.get<JobRoleListApi[]>("/job-roles", {
						headers: { Authorization: authHeader },
					})
				: await this.client.get<JobRoleListApi[]>("/job-roles");
			return this.filterOpenRoles(
				jobRoleListResponse.data.map(mapJobRoleListApiToItem),
			);
		} catch (requestError) {
			if (
				axios.isAxiosError(requestError) &&
				requestError.response?.status === 404
			) {
				return [];
			}
			throw requestError;
		}
	}

	async getRoleById(
		jobRoleId: number,
		authHeader?: string,
	): Promise<JobRole | null> {
		if (this.useFallbackMock) {
			return this.getFallbackJobRoleById(jobRoleId);
		}

		try {
			const jobRoleDetailResponse = authHeader
				? await this.client.get<JobRoleDetailApi>(`/job-roles/${jobRoleId}`, {
						headers: { Authorization: authHeader },
					})
				: await this.client.get<JobRoleDetailApi>(`/job-roles/${jobRoleId}`);
			return mapJobRoleDetailApiToModel(jobRoleDetailResponse.data);
		} catch (requestError) {
			if (
				axios.isAxiosError(requestError) &&
				requestError.response?.status === 404
			) {
				return null;
			}
			throw requestError;
		}
	}

	private getFallbackOpenRoles(): JobRoleListItem[] {
		return this.filterOpenRoles(this.fallbackData.map(mapJobRoleToListItem));
	}

	private getFallbackJobRoleById(jobRoleId: number): JobRole | null {
		return (
			this.fallbackData.find((jobRole) => jobRole.id === jobRoleId) ?? null
		);
	}

	private filterOpenRoles(
		jobRoleListItems: JobRoleListItem[],
	): JobRoleListItem[] {
		return jobRoleListItems.filter(
			(jobRole) => jobRole.status.toLowerCase() === "open",
		);
	}
}
