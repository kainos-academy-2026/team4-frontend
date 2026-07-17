import type { AxiosInstance } from "axios";

import apiClient from "../config/apiClient.js";

export type BackendApplicationResponse = {
	status: number;
	data: unknown;
};

export type UploadUrlResponse = {
	presignedUrl: string;
	s3Key: string;
};

export type SubmitApplicationPayload = {
	s3Key: string;
	cvFileName: string;
	cvMimeType: string;
	cvSizeBytes: number;
};

export class JobApplicationService {
	constructor(private readonly backendClient: AxiosInstance = apiClient) {}

	async getUploadUrl(
		jobRoleId: number,
		authHeader: string,
		fileName: string,
	): Promise<UploadUrlResponse> {
		const response = await this.backendClient.get<UploadUrlResponse>(
			`/job-roles/${jobRoleId}/applications/upload-url`,
			{
				params: { fileName },
				headers: { Authorization: authHeader },
			},
		);
		return response.data;
	}

	async submitApplication(
		jobRoleId: number,
		authHeader: string,
		payload: SubmitApplicationPayload,
	): Promise<BackendApplicationResponse> {
		const backendResponse = await this.backendClient.post(
			`/job-roles/${jobRoleId}/applications`,
			payload,
			{ headers: { Authorization: authHeader } },
		);

		return {
			status: backendResponse.status,
			data: backendResponse.data,
		};
	}
}
