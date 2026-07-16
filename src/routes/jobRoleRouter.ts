import { Router } from "express";

import { JobRoleController } from "../controllers/jobRoleController";
import { requireRoleHtml } from "../middleware/authContext";
import { JobRoleService } from "../services/jobRoleService";

const jobRoleRouter = Router();
const jobRoleController = new JobRoleController(new JobRoleService());
const readAccessRoles = ["applicant", "recruitment_admin", "user"] as const;

jobRoleRouter.get("/job-roles", requireRoleHtml(readAccessRoles), (request, response) =>
	jobRoleController.renderListPage(request, response),
);
jobRoleRouter.get("/job-roles/:id", requireRoleHtml(readAccessRoles), (request, response) =>
	jobRoleController.renderDetailPage(request, response),
);

export default jobRoleRouter;
