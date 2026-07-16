import type { Request, Response } from "express";

import type { JobRoleService } from "../services/jobRoleService.js";

export class HomeController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	async getHome(request: Request, response: Response): Promise<void> {
		try {
			const authHeader = this.getAuthHeader(request);
			const jobRoles = await this.jobRoleService.getOpenRoles(
				authHeader ?? undefined,
			);
			const jobRolesWithApplicationStatuses = jobRoles.map((jobRole) =>
				jobRole.myApplication
					? {
							...jobRole,
							status: "In Progress",
						}
					: jobRole,
			);

			response.render("index", {
				jobRoles: jobRolesWithApplicationStatuses,
				errorMessage: null,
			});
		} catch {
			response.render("index", {
				jobRoles: [],
				errorMessage:
					"Something went wrong loading job roles. Please try again later.",
			});
		}
	}

	private getAuthHeader(request: Request): string | null {
		const accessToken = request.cookies.access_token as string | undefined;
		if (!accessToken) {
			return null;
		}
		return `Bearer ${accessToken}`;
	}
}
