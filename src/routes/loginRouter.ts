import { Router } from "express";

import { getLogin, postLogout } from "../controllers/loginController";

const loginRouter = Router();

loginRouter.get("/login", getLogin);
loginRouter.post("/logout", postLogout);

export default loginRouter;
