import { Router } from "express";

import { RegisterController } from "../controllers/registerController";
import { validateRegisterUser } from "../middleware/registerUserMiddleware";
import { RegisterService } from "../services/registerService";

const registerRouter = Router();
const registerController = new RegisterController(new RegisterService());

registerRouter.get("/register", (request, response) =>
	registerController.getRegister(request, response),
);

registerRouter.post(
	"/auth/register",
	validateRegisterUser,
	(request, response) => registerController.postRegister(request, response),
);

export default registerRouter;
