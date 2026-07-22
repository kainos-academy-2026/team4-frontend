import type { AxiosInstance } from "axios";

import apiClient from "../config/apiClient.js";

export type LoginResponse = {
	accessToken: string;
};

export class AuthService {
	constructor(private readonly client: AxiosInstance = apiClient) {}

	async login(email: string, password: string): Promise<LoginResponse> {
		const response = await this.client.post<LoginResponse>("/auth/login", {
			email,
			password,
		});

		return response.data;
	}
}
