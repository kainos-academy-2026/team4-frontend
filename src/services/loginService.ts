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
			const accessToken = payload.accessToken ?? payload.token;
			if (typeof accessToken !== "string" || accessToken.length === 0) {
				throw new LoginServiceError(500, "Login failed. Please try again.");
			}

			return accessToken;
		} catch (error) {
			if (error instanceof LoginServiceError) {
				throw error;
			}

			// Generic error for all failures
			throw new LoginServiceError(500, "Login failed. Please try again.");
		}
	}
}
