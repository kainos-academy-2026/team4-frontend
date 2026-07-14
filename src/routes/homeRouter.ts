import { Router } from "express";

import { HomeController } from "../controllers/homeController.js";
import { JobRoleService } from "../services/jobRoleService.js";

const homeRouter = Router();
const homeController = new HomeController(new JobRoleService());

homeRouter.get("/", (request, response) =>
	homeController.getHome(request, response),
);

export default homeRouter;
