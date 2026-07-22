import { Router } from "express";

import { LoginApiController } from "../controllers/loginApiController.js";
import { LoginRequestSchema } from "../dto/loginDto.js";
import { validateBody } from "../middleware/loginValidation.js";
import { AuthService } from "../services/authService.js";

const loginApiRouter = Router();
const loginApiController = new LoginApiController(new AuthService());

loginApiRouter.post(
	"/api/login",
	validateBody(LoginRequestSchema),
	(request, response) => loginApiController.login(request, response),
);

export default loginApiRouter;
