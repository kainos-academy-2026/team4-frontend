import { Router } from "express";

import { JobRoleController } from "../controllers/jobRoleController";
import upload from "../middleware/upload";
import { JobApplicationService } from "../services/jobApplicationService";
import { JobRoleService } from "../services/jobRoleService";

const jobRoleRouter = Router();
const jobRoleController = new JobRoleController(
	new JobRoleService(),
	new JobApplicationService(),
);

jobRoleRouter.post(
	"/job-roles/:id/applications",
	upload.single("cvFile"),
	(request, response) => jobRoleController.submitApplication(request, response),
);
jobRoleRouter.post(
	"/job-roles/:id/apply",
	upload.single("cvFile"),
	(request, response) =>
		jobRoleController.submitApplicationPage(request, response),
);
jobRoleRouter.get("/job-roles/:id/apply", (request, response) =>
	jobRoleController.renderApplicationPage(request, response),
);
jobRoleRouter.get("/job-roles/:id", (request, response) =>
	jobRoleController.renderDetailPage(request, response),
);

export default jobRoleRouter;
