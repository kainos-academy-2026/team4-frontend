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
				jobRoles: jobRoles.map((jobRole) => ({
					roleName: jobRole.roleName,
					location: jobRole.location,
					capability: jobRole.capability,
					band: jobRole.band,
					closingDate: jobRole.closingDate,
					status: jobRole.status,
				})),
			};

			res.render("job-role-list", viewModel);
		} catch (error) {
			const errorMessage =
				error instanceof JobRoleServiceError
					? error.message
					: "Unable to load job roles at the moment.";

			const statusCode =
				error instanceof JobRoleServiceError && error.code === "NOT_FOUND"
					? (error.status ?? 404)
					: 502;

			res.status(statusCode).render("job-role-list", {
				errorMessage,
				jobRoles: [],
			} satisfies JobRoleListViewModel);
		}
	}
}
