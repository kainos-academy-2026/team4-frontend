import axios, { type AxiosInstance } from "axios";

import apiClient from "../config/apiClient";
import type { LoginRequestDto, LoginResponseDto } from "../dto/loginDto";
import { LoginServiceError } from "./loginServiceError";
import type { LoginPayload, LoginResult } from "./loginServiceModels";

export class LoginService {
	constructor(private readonly client: AxiosInstance = apiClient) {}

	async authenticate(credentials: LoginRequestDto): Promise<string> {
		try {
			const response = await this.client.post<Partial<LoginResponseDto>>(
				"/auth/login",
				credentials,
			);

			const payload = response.data;
			if (
				typeof payload.accessToken !== "string" ||
				payload.accessToken.length === 0
			) {
				throw new LoginServiceError(500, "Login failed. Please try again.");
			}

			return payload.accessToken;
		} catch (error) {
			if (error instanceof LoginServiceError) {
				throw error;
			}

			throw new LoginServiceError(500, "Login failed. Please try again.");
		}
	}

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
