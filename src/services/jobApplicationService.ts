import type { AxiosInstance } from "axios";
import FormData from "form-data";

import apiClient from "../config/apiClient.js";

export type BackendApplicationResponse = {
	status: number;
	data: unknown;
};

export class JobApplicationService {
	constructor(private readonly backendClient: AxiosInstance = apiClient) {}

	async submitApplication(
		jobRoleId: number,
		authHeader: string,
		file: Express.Multer.File,
	): Promise<BackendApplicationResponse> {
		const formData = new FormData();
		formData.append("cvFile", file.buffer, {
			filename: file.originalname,
			contentType: file.mimetype,
			knownLength: file.size,
		});

		const backendResponse = await this.backendClient.post(
			`/job-roles/${jobRoleId}/applications`,
			formData,
			{ headers: { Authorization: authHeader, ...formData.getHeaders() } },
		);

		return {
			status: backendResponse.status,
			data: backendResponse.data,
		};
	}

	async getApplicationStatus(
		jobRoleId: number,
		authHeader: string,
	): Promise<unknown> {
		const backendResponse = await this.backendClient.get(
			`/job-roles/${jobRoleId}/applications/me`,
			{ headers: { Authorization: authHeader } },
		);

		return backendResponse.data;
	}
}
