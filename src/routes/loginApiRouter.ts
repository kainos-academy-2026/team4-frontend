import { Router } from "express";

import { LoginApiController } from "../controllers/loginApiController.js";
import { AuthService } from "../services/authService.js";

const loginApiRouter = Router();
const loginApiController = new LoginApiController(new AuthService());

loginApiRouter.post("/api/login", (request, response) =>
	loginApiController.login(request, response),
);

export default loginApiRouter;
import axios from "axios";
import { Router } from "express";

import apiClient from "../config/apiClient.js";

const loginApiRouter = Router();

loginApiRouter.post("/api/login", async (request, response) => {
	const { email, password } = request.body as {
		email?: unknown;
		password?: unknown;
	};

	if (typeof email !== "string" || typeof password !== "string") {
		response.status(400).json({ message: "Email and password are required." });
		return;
	}

	try {
		const backendResponse = await apiClient.post<{ accessToken: string }>(
			"/auth/login",
			{ email, password },
		);
		response.status(200).json(backendResponse.data);
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 401) {
			response.status(401).json({ message: "Invalid email or password." });
			return;
		}
		response.status(502).json({ message: "Login service unavailable." });
	}
});

export default loginApiRouter;
