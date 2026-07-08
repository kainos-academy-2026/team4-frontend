import axios, { type AxiosInstance } from "axios";

import apiClient from "../config/apiClient";
import { fallbackJobRoles } from "../mocks/jobRoles";
import type { JobRole } from "../models/jobRole";
import { JobRoleServiceError } from "./jobRoleServiceError";

export class JobRoleService {
	constructor(
		private readonly client: AxiosInstance = apiClient,
		private readonly fallbackData: JobRole[] = fallbackJobRoles,
		private readonly useFallbackMock: boolean = process.env
			.USE_JOB_ROLE_FALLBACK_MOCK !== "false",
	) {}

	async getOpenJobRoles(): Promise<JobRole[]> {
		try {
			const response = await this.client.get<JobRole[]>("/job-roles");
			return this.toOpenJobRoles(response.data);
		} catch (error) {
			if (!axios.isAxiosError(error)) {
				throw error;
			}

			if (this.useFallbackMock) {
				return this.toOpenJobRoles(this.fallbackData);
			}

			const status = error.response?.status;

			if (status === 404) {
				throw new JobRoleServiceError(
					"No job roles were found.",
					"NOT_FOUND",
					status,
				);
			}

			if (typeof status === "number" && status >= 500) {
				throw new JobRoleServiceError(
					"Backend service is currently unavailable.",
					"BACKEND_ERROR",
					status,
				);
			}

			if (status === undefined) {
				throw new JobRoleServiceError(
					"Could not connect to backend service.",
					"NETWORK_ERROR",
				);
			}

			throw new JobRoleServiceError(
				"Unexpected response when loading job roles.",
				"UNKNOWN_ERROR",
				status,
			);
		}
	}

	private toOpenJobRoles(jobRoles: JobRole[]): JobRole[] {
		return jobRoles.filter(
			(jobRole) => jobRole.status.toLowerCase() === "open",
		);
	}
}
