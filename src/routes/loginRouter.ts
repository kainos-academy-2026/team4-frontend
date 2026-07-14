import { Router } from "express";

import { LoginController } from "../controllers/loginController";
import { getLogin, postLogout } from "../controllers/loginController";
import { LoginService } from "../services/loginService";

const loginService = new LoginService();
const loginController = new LoginController(loginService);

const loginRouter = Router();

loginRouter.get("/login", getLogin);
loginRouter.post("/login", (req, res) => loginController.postLogin(req, res));
loginRouter.post("/logout", postLogout);

export default loginRouter;
