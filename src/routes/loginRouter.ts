import { Router } from "express";

import { getLogin, postLogin } from "../controllers/loginController";
import { validateLoginUser } from "../middleware/loginUserMiddleware";

const loginRouter = Router();

loginRouter.get("/login", getLogin);
loginRouter.post("/auth/login", validateLoginUser, postLogin);

export default loginRouter;
