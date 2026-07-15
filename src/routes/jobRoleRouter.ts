import { Router } from "express";
import multer from "multer";

import { JobRoleController } from "../controllers/jobRoleController";
import { JobApplicationService } from "../services/jobApplicationService";
import { JobRoleService } from "../services/jobRoleService";

const jobRoleRouter = Router();
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 },
});
const jobRoleController = new JobRoleController(
	new JobRoleService(),
	new JobApplicationService(),
);

jobRoleRouter.post(
	"/job-roles/:id/applications",
	upload.single("cvFile"),
	(request, response) => jobRoleController.submitApplication(request, response),
);
jobRoleRouter.get("/job-roles/:id/applications/me", (request, response) =>
	jobRoleController.getApplicationStatus(request, response),
);
jobRoleRouter.get("/job-roles/:id/apply", (request, response) =>
	jobRoleController.renderApplicationPage(request, response),
);
jobRoleRouter.get("/job-roles/:id", (request, response) =>
	jobRoleController.renderDetailPage(request, response),
);

export default jobRoleRouter;
