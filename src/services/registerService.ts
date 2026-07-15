import axios, { type AxiosInstance } from "axios";

import apiClient from "../config/apiClient";

export interface RegisterUserPayload {
	email: string;
	password: string;
}

export interface RegisteredUser {
	id: string;
	email: string;
	role: string;
}

export class RegisterServiceError extends Error {
	constructor(
		public readonly status: 400 | 409 | 500,
		message: string,
	) {
		super(message);
		this.name = "RegisterServiceError";
	}
}

export class RegisterService {
	constructor(private readonly client: AxiosInstance = apiClient) {}

	async register(payload: RegisterUserPayload): Promise<RegisteredUser> {
		try {
			const registrationResponse = await this.client.post<RegisteredUser>(
				"/auth/register",
				payload,
			);

			return registrationResponse.data;
		} catch (requestError) {
			if (axios.isAxiosError(requestError)) {
				if (requestError.response?.status === 400) {
					throw new RegisterServiceError(400, "Invalid registration payload");
				}

				if (requestError.response?.status === 409) {
					throw new RegisterServiceError(409, "User already exists");
				}
			}

			throw new RegisterServiceError(500, "Internal server error");
		}
	}
}
