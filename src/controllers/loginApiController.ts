import axios from "axios";
import type { Request, Response } from "express";

import type { AuthService } from "../services/authService.js";

export class LoginApiController {
	constructor(private readonly authService: AuthService) {}

	async login(request: Request, response: Response): Promise<void> {
		const { email, password } = request.body as {
			email?: unknown;
			password?: unknown;
		};

		if (typeof email !== "string" || typeof password !== "string") {
			response
				.status(400)
				.json({ message: "Email and password are required." });
			return;
		}

		try {
			const loginResponse = await this.authService.login(email, password);
			response.status(200).json(loginResponse);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 401) {
				response.status(401).json({ message: "Invalid email or password." });
				return;
			}

			response.status(502).json({ message: "Login service unavailable." });
		}
	}
}
