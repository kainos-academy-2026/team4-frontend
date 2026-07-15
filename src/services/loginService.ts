import axios, { type AxiosInstance } from "axios";

import apiClient from "../config/apiClient";

export interface LoginPayload {
	email: string;
	password: string;
}

export interface LoginResult {
	token?: string;
	email?: string;
	[key: string]: unknown;
}

export class LoginServiceError extends Error {
	constructor(
		public readonly status: 400 | 401 | 500,
		message: string,
	) {
		super(message);
		this.name = "LoginServiceError";
	}
}

export class LoginService {
	constructor(private readonly client: AxiosInstance = apiClient) {}

	async login(payload: LoginPayload): Promise<LoginResult> {
		try {
			const loginResponse = await this.client.post<LoginResult>(
				"/auth/login",
				payload,
			);

			return loginResponse.data;
		} catch (requestError) {
			if (axios.isAxiosError(requestError)) {
				if (requestError.response?.status === 400) {
					throw new LoginServiceError(400, "Invalid login payload");
				}

				if (requestError.response?.status === 401) {
					throw new LoginServiceError(401, "Invalid email or password");
				}
			}

			throw new LoginServiceError(500, "Internal server error");
		}
	}
}
