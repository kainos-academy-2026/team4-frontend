import axios, { type AxiosInstance } from "axios";

import apiClient from "../config/apiClient";
import {
	type JobRoleDetailApi,
	type JobRoleListApi,
	mapJobRoleDetailApiToModel,
	mapJobRoleListApiToItem,
} from "../mappers/jobRoleMapper";
import type { JobRole } from "../models/jobRole";
import type { JobRoleListItem } from "../models/jobRoleListModels";

export class JobRoleService {
	constructor(private readonly client: AxiosInstance = apiClient) {}
	constructor(private readonly client: AxiosInstance = apiClient) {}

	async getOpenRoles(authHeader?: string): Promise<JobRoleListItem[]> {
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

	private filterOpenRoles(
		jobRoleListItems: JobRoleListItem[],
	): JobRoleListItem[] {
		return jobRoleListItems.filter(
			(jobRole) => jobRole.status.toLowerCase() === "open",
		);
	}
}
