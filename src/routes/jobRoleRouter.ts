import { Router } from "express";

import { JobRoleController } from "../controllers/jobRoleController";
import { JobRoleService } from "../services/jobRoleService";

const jobRoleRouter = Router();
const jobRoleController = new JobRoleController(new JobRoleService());

jobRoleRouter.get("/job-roles/:id/apply", (request, response) =>
	jobRoleController.renderApplicationPage(request, response),
);
jobRoleRouter.get("/job-roles/:id", (request, response) =>
	jobRoleController.renderDetailPage(request, response),
);

export default jobRoleRouter;
