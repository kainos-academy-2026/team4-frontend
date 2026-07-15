import type { Request, Response } from "express";
import type { JobRole } from "../models/jobRole";
import { jobRoleIdSchema } from "../models/jobRole";
import type { JobRoleService } from "../services/jobRoleService";

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	async renderDetailPage(request: Request, response: Response): Promise<void> {
		try {
			const parsedJobRoleId = jobRoleIdSchema.safeParse(request.params.id);

			if (!parsedJobRoleId.success) {
				response.redirect("/404");
				return;
			}

			const jobRole = await this.jobRoleService.getRoleById(
				parsedJobRoleId.data,
			);

			if (!jobRole) {
				response.redirect("/404");
				return;
			}

			response.render("job-role-detail", {
				jobRole,
				showApplyForRole: this.canAcceptApplications(jobRole),
			});
		} catch (controllerError) {
			console.error(controllerError);
			response.render("job-role-detail", {
				errorMessage: "Something went wrong. Please try again later.",
				jobRole: null,
				showApplyForRole: false,
			});
		}
	}

	async renderApplicationPage(
		request: Request,
		response: Response,
	): Promise<void> {
		try {
			const parsedJobRoleId = jobRoleIdSchema.safeParse(request.params.id);

			if (!parsedJobRoleId.success) {
				response.redirect("/404");
				return;
			}

			const jobRole = await this.jobRoleService.getRoleById(
				parsedJobRoleId.data,
			);

			if (!jobRole) {
				response.redirect("/404");
				return;
			}

			const canApply = this.canAcceptApplications(jobRole);

			response.render("job-role-application", {
				errorMessage: canApply
					? null
					: "Applications are closed for this role.",
				jobRole,
				canApply,
			});
		} catch (controllerError) {
			console.error(controllerError);
			response.render("job-role-application", {
				errorMessage: "Something went wrong. Please try again later.",
				jobRole: null,
				canApply: false,
			});
		}
	}

	private canAcceptApplications(jobRole: JobRole): boolean {
		return (
			jobRole.status.toLowerCase() === "open" &&
			jobRole.numberOfOpenPositions > 0
		);
	}
}
