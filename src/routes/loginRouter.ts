import { Router } from "express";

import { getLogin } from "../controllers/loginController";

const loginRouter = Router();

loginRouter.get("/login", getLogin);

export default loginRouter;
