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
}
