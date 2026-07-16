import axios, { type AxiosInstance } from "axios";

import apiClient from "../config/apiClient";
import { RegisterServiceError } from "./registerServiceError";
import type {
	RegisteredUser,
	RegisterUserPayload,
} from "./registerServiceModels";

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
