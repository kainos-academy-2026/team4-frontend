import axios from "axios";
import apiClient from "../config/apiClient";
import type { LoginRequestDto, LoginResponseDto } from "../dto/loginDto";
import { LoginServiceError } from "./loginServiceError";
import type { LoginPayload, LoginResult } from "./loginServiceModels";

export class LoginService {
	async authenticate(credentials: LoginRequestDto): Promise<string> {
		try {
			const response = await apiClient.post<Partial<LoginResponseDto>>(
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

			// Generic error for all failures
			throw new LoginServiceError(500, "Login failed. Please try again.");
		}
	}

	async login(payload: LoginPayload): Promise<LoginResult> {
		try {
			const loginResponse = await apiClient.post<LoginResult>(
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
import axios from "axios";

import apiClient from "../config/apiClient";
import type { LoginRequestDto, LoginResponseDto } from "../dto/loginDto";
import { LoginServiceError } from "./loginServiceError";

export class LoginService {
	async authenticate(credentials: LoginRequestDto): Promise<string> {
		try {
			const response = await apiClient.post<Partial<LoginResponseDto>>(
				"/auth/login",
				credentials,
			);

			const payload = response.data;
			if (
				typeof payload.accessToken !== "string" ||
				payload.accessToken.length === 0
			) {
				throw new LoginServiceError(
					502,
					"Login service unavailable. Please try again later.",
				);
			}

			return payload.accessToken;
		} catch (error) {
			if (error instanceof LoginServiceError) {
				throw error;
			}

			if (axios.isAxiosError(error) && error.response?.status === 401) {
				throw new LoginServiceError(
					401,
					"Invalid email or password. Please try again.",
				);
			}

			throw new LoginServiceError(
				502,
				"Login service unavailable. Please try again later.",
			);
		}
	}
}
