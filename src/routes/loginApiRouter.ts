import { Router } from "express";

import { LoginApiController } from "../controllers/loginApiController.js";
import { AuthService } from "../services/authService.js";

const loginApiRouter = Router();
const loginApiController = new LoginApiController(new AuthService());

loginApiRouter.post("/api/login", (request, response) =>
	loginApiController.login(request, response),
);

export default loginApiRouter;
