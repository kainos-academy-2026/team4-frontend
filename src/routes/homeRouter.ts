import { Router } from "express";

import { HomeController } from "../controllers/homeController.js";
import { authorize } from "../middleware/authContext";
import { Role } from "../models/role";
import { JobRoleService } from "../services/jobRoleService.js";

const homeRouter = Router();
const homeController = new HomeController(new JobRoleService());

homeRouter.get("/", authorize([Role.User, Role.Admin]), (request, response) =>
	homeController.getHome(request, response),
);

export default homeRouter;
