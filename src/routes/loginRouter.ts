import { Router } from "express";

import { getLogin, postLogin, postLogout } from "../controllers/loginController";

const loginRouter = Router();

loginRouter.get("/login", getLogin);
loginRouter.post("/login", postLogin);
loginRouter.post("/logout", postLogout);

export default loginRouter;
