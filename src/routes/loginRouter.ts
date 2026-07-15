import { Router } from "express";

import {
	getLogin,
	LoginController,
	postLogin,
	postLogout,
} from "../controllers/loginController";
import { LoginRequestSchema } from "../dto/loginDto";
import { validateLoginUser } from "../middleware/loginUserMiddleware";
import { validateBody } from "../middleware/loginValidation";
import { LoginService } from "../services/loginService";

const loginService = new LoginService();
const loginController = new LoginController(loginService);

const loginRouter = Router();

loginRouter.get("/login", getLogin);

export default loginRouter;
