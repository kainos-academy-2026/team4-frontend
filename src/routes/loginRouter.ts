import { Router } from "express";

import {
	getLogin,
	LoginController,
	postLogout,
} from "../controllers/loginController";
import { LoginRequestSchema } from "../dto/loginDto";
import { requireAuthHtml } from "../middleware/authContext";
import { validateBody } from "../middleware/loginValidation";
import { LoginService } from "../services/loginService";

const loginService = new LoginService();
const loginController = new LoginController(loginService);

const loginRouter = Router();

loginRouter.get("/login", getLogin);
loginRouter.post("/login", validateBody(LoginRequestSchema), (req, res) =>
	loginController.postLogin(req, res),
);
loginRouter.post("/logout", requireAuthHtml, postLogout);

export default loginRouter;
