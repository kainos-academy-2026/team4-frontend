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
