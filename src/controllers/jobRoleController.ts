import type { Request, Response } from "express";
import type { JobRoleListViewModel } from "../models/jobRoleListViewModel";
import type { JobRoleService } from "../services/jobRoleService";

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	async getAll(_req: Request, res: Response): Promise<void> {
		try {
			const jobRoles = await this.jobRoleService.getOpenJobRoles();

			const viewModel: JobRoleListViewModel = {
				errorMessage: null,
				jobRoles,
			};

			res.render("job-role-list", viewModel);
		} catch (error) {
			console.error(error);

			res.status(502).render("job-role-list", {
				errorMessage: "Something went wrong. Please try again later.",
				jobRoles: [],
			} satisfies JobRoleListViewModel);
		}
	}

	async getById(_req: Request, res: Response): Promise<void> {
		try {
			const id = Number(_req.params.id);

			if (Number.isNaN(id)) {
				res.status(400).render("job-role-detail", {
					errorMessage: "Invalid job role id.",
					jobRole: null,
				});
				return;
			}

			const jobRole = await this.jobRoleService.getJobRolesById(id);

			if (!jobRole) {
				res.status(404).render("job-role-detail", {
					errorMessage: "Job role not found.",
					jobRole: null,
				});
				return;
			}

			res.render("job-role-detail", { jobRole });
		} catch (error) {
			console.error(error);
			res.status(502).render("job-role-detail", {
				errorMessage: "Something went wrong. Please try again later.",
				jobRole: null,
			});
		}
	}
}
