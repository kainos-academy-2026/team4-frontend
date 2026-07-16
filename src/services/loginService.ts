import apiClient from "../config/apiClient";
import type { LoginRequestDto, LoginResponseDto } from "../dto/loginDto";
import { LoginServiceError } from "./loginServiceError";

export class LoginService {
	async authenticate(credentials: LoginRequestDto): Promise<string> {
		try {
			const response = await apiClient.post<LoginResponseDto>(
				"/login",
				credentials,
			);


			const payload = response.data;
			if(!payload.token) {
				throw new LoginServiceError(500, "Login failed. Please try again.");
			}

			return payload.token;
		} catch (error) {
			if (error instanceof LoginServiceError) {
				throw error;
			}

			// Generic error for all failures
			throw new LoginServiceError(500, "Login failed. Please try again.");
		}
	}
}
