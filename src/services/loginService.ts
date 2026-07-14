import type { LoginRequestDto, LoginResponseDto } from "../dto/loginDto";

type FetchFn = typeof fetch;

export class LoginServiceError extends Error {
	constructor(
		public readonly statusCode: number,
		message: string,
	) {
		super(message);
		this.name = "LoginServiceError";
	}
}

export class LoginService {
	constructor(
		private readonly apiBaseUrl: string = process.env.API_BASE_URL ?? "",
		private readonly fetchFn: FetchFn = globalThis.fetch,
	) {}

	async authenticate(credentials: LoginRequestDto): Promise<string> {
		if (!this.apiBaseUrl) {
			throw new LoginServiceError(
				500,
				"Something went wrong. Please try again.",
			);
		}

		let response: Response;
		try {
			response = await this.fetchFn(`${this.apiBaseUrl}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(credentials),
			});
		} catch {
			throw new LoginServiceError(
				500,
				"Something went wrong. Please try again.",
			);
		}

		if (response.status === 401) {
			throw new LoginServiceError(
				401,
				"Invalid email or password. Please try again.",
			);
		}

		if (!response.ok) {
			throw new LoginServiceError(
				500,
				"Something went wrong. Please try again.",
			);
		}

		const payload = (await response.json()) as Partial<LoginResponseDto>;
		if (
			typeof payload.accessToken !== "string" ||
			payload.accessToken.length === 0
		) {
			throw new LoginServiceError(
				500,
				"Something went wrong. Please try again.",
			);
		}

		return payload.accessToken;
	}
}
