import type { Request, Response } from "express";
import { jobRoleIdSchema } from "../models/jobRole";
import type { JobRoleListPage } from "../models/jobRoleListModels";
import type { JobRoleService } from "../services/jobRoleService";

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	async renderListPage(request: Request, response: Response): Promise<void> {
		try {
			const accessToken = request.cookies.access_token as string | undefined;
			const jobRoles = await this.jobRoleService.getOpenRoles(
				accessToken ?? "",
			);

			const viewModel: JobRoleListPage = {
				errorMessage: null,
				jobRoles,
			};

			response.render("job-role-list", viewModel);
		} catch (controllerError) {
			console.error(controllerError);

			response.render("job-role-list", {
				errorMessage: "Something went wrong. Please try again later.",
				jobRoles: [],
			} satisfies JobRoleListPage);
		}
	}

	async renderDetailPage(request: Request, response: Response): Promise<void> {
		try {
			const accessToken = request.cookies.access_token as string | undefined;
			const parsedJobRoleId = jobRoleIdSchema.safeParse(request.params.id);

			if (!parsedJobRoleId.success) {
				response.render("job-role-detail", {
					errorMessage: "Invalid job role id.",
					jobRole: null,
				});
				return;
			}

			const jobRole = await this.jobRoleService.getRoleById(
				parsedJobRoleId.data,
				accessToken ?? "",
			);

			if (!jobRole) {
				response.redirect("/404");
				return;
			}

			response.render("job-role-detail", { jobRole });
		} catch (controllerError) {
			console.error(controllerError);
			response.render("job-role-detail", {
				errorMessage: "Something went wrong. Please try again later.",
				jobRole: null,
			});
		}
	}
}
