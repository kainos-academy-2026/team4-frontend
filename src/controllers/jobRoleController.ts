import type { Request, Response } from "express";
import { JobRoleService } from "../services/jobRoleService";
import { JobRoleServiceError } from "../services/jobRoleServiceError";
import type { JobRoleListViewModel } from "./jobRoleListViewModel";

export class JobRoleController {
	constructor(
		private readonly jobRoleService: JobRoleService,
	) {}

	async getAll(_req: Request, res: Response): Promise<void> {
		try {
			const jobRoles = await this.jobRoleService.getOpenJobRoles();

			const viewModel: JobRoleListViewModel = {
				errorMessage: null,
				jobRoles,
			};

			res.render("job-role-list", viewModel);
		} catch (error) {
			console.error(
				error instanceof Error
					? error.message
					: "Unexpected error while loading job roles.",
			);

			const statusCode =
				error instanceof JobRoleServiceError && error.code === "NOT_FOUND"
					? (error.status ?? 404)
					: 502;

			res.status(statusCode).render("job-role-list", {
				errorMessage: "Something went wrong. Please try again later.",
				jobRoles: [],
			} satisfies JobRoleListViewModel);
		}
	}
}
