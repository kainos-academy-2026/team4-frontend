import type { Request, Response } from "express";

import { readAuthSession } from "../auth/session";
import type { JobRoleListViewModel } from "../models/jobRoleListViewModel";
import type { JobRoleService } from "../services/jobRoleService";

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	async getAll(req: Request, res: Response): Promise<void> {
		try {
			const token = readAuthSession(req)?.token ?? "";
			const jobRoles = await this.jobRoleService.getOpenJobRoles(token);

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
