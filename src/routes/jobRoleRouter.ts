import { Router } from "express";

import { JobRoleController } from "../controllers/jobRoleController";
import { JobRoleService } from "../services/jobRoleService";
import { authorize } from "../middleware/authContext";
import { Role } from "../models/role";


const jobRoleRouter = Router();
const jobRoleController = new JobRoleController(new JobRoleService());


jobRoleRouter.get("/job-roles", authorize([Role.User, Role.Admin]), (request, response) =>
	jobRoleController.renderListPage(request, response),
);
jobRoleRouter.get("/job-roles/:id", authorize([Role.User, Role.Admin]), (request, response) =>
	jobRoleController.renderDetailPage(request, response),
);

export default jobRoleRouter;
