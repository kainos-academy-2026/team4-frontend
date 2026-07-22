import axios, { type AxiosInstance } from "axios";

import apiClient from "../config/apiClient.js";
import type { LoginRequestDto, LoginResponseDto } from "../dto/loginDto";
import { LoginServiceError } from "./loginServiceError";

export class LoginService {
	constructor(private readonly client: AxiosInstance = apiClient) {}

	async authenticate(credentials: LoginRequestDto): Promise<string> {
		const { email, password } = credentials;

		if (!email || !password) {
			throw new LoginServiceError(400, "Invalid login payload");
		}

		try {
			const response = await this.client.post<LoginResponseDto>("/auth/login", {
				email,
				password,
			});

			return response.data.accessToken;
		} catch (requestError) {
			if (axios.isAxiosError(requestError)) {
				if (requestError.response?.status === 401) {
					throw new LoginServiceError(401, "Invalid email or password.");
				}

				if (requestError.response?.status === 400) {
					throw new LoginServiceError(400, "Invalid login payload");
				}
			}

			throw new LoginServiceError(
				502,
				"Login service unavailable. Please try again later.",
			);
		}
	}
}
