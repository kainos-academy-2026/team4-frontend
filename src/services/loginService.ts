import axios from "axios";
import axios from "axios";

import apiClient from "../config/apiClient";
import type { LoginRequestDto, LoginResponseDto } from "../dto/loginDto";
import { logger } from "../utils/logger";
import { LoginServiceError } from "./loginServiceError";
import type { LoginPayload, LoginResult } from "./loginServiceModels";

export class LoginService {
	async authenticate(credentials: LoginRequestDto): Promise<string> {
		try {
			const response = await apiClient.post<LoginResponseDto>(
				"/auth/login",
				credentials,
			);

			const payload = response.data;
			if (!payload?.accessToken) {
				logger.error(
					"Backend login endpoint returned response without accessToken",
					null,
					{
						endpoint: "POST /auth/login",
						email: credentials.email,
						responseKeys: Object.keys(payload || {}),
					},
				);
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

			if (axios.isAxiosError(error)) {
				const status = error.response?.status;

				logger.error("Backend login endpoint returned HTTP error", error, {
					endpoint: "POST /auth/login",
					httpStatus: status,
					email: credentials.email,
				});

				if (status === 400) {
					throw new LoginServiceError(400, "Invalid login payload");
				}

				if (status === 401) {
					throw new LoginServiceError(401, "Invalid email or password");
				}

				if (status === 500) {
					throw new LoginServiceError(500, "Server error. Please try again.");
				}
			}

			logger.error("Unexpected error during authentication", error, {
				endpoint: "POST /auth/login",
				email: credentials.email,
			});

			throw new LoginServiceError(500, "Login failed. Please try again.");
		}
	}
}
