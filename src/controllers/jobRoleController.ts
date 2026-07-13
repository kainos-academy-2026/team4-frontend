import type { Request, Response } from "express";
import type { JobRoleListPage } from "../models/jobRoleListModels";
import type { JobRoleService } from "../services/jobRoleService";

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	async renderListPage(_request: Request, response: Response): Promise<void> {
		try {
			const jobRoles = await this.jobRoleService.getOpenRoles();

			const viewModel: JobRoleListPage = {
				errorMessage: null,
				jobRoles,
			};

			response.render("job-role-list", viewModel);
		} catch (controllerError) {
			console.error(controllerError);

			response.status(502).render("job-role-list", {
				errorMessage: "Something went wrong. Please try again later.",
				jobRoles: [],
			} satisfies JobRoleListPage);
		}
	}

	async renderDetailPage(request: Request, response: Response): Promise<void> {
		try {
			const jobRoleId = Number(request.params.id);

			if (Number.isNaN(jobRoleId)) {
				response.status(400).render("job-role-detail", {
					errorMessage: "Invalid job role id.",
					jobRole: null,
				});
				return;
			}

			const jobRole = await this.jobRoleService.getRoleById(jobRoleId);

			if (!jobRole) {
				response.status(404).render("job-role-detail", {
					errorMessage: "Job role not found.",
					jobRole: null,
				});
				return;
			}

			response.render("job-role-detail", { jobRole });
		} catch (controllerError) {
			console.error(controllerError);
			response.status(502).render("job-role-detail", {
				errorMessage: "Something went wrong. Please try again later.",
				jobRole: null,
			});
		}
	}
}
