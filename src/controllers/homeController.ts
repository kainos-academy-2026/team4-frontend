import type { Request, Response } from "express";

import { isDemoAuthEnabled } from "../config/auth";
import type { JobRoleService } from "../services/jobRoleService.js";

export class HomeController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	/*async getHome(_request: Request, response: Response): Promise<void> {
		try {
			const jobRoles = await this.jobRoleService.getOpenRoles();
			response.render("index", {
				demoAuthEnabled: isDemoAuthEnabled(),
				jobRoles,
				errorMessage: null,
			});
		} catch {
			response.render("index", {
				demoAuthEnabled: isDemoAuthEnabled(),
				jobRoles: [],
				errorMessage:
					"Something went wrong loading job roles. Please try again later.",
			});
		}
	}
}*/
import type { JobRoleService } from "../services/jobRoleService.js";

export class HomeController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	async getHome(_request: Request, response: Response): Promise<void> {
		try {
			const jobRoles = await this.jobRoleService.getOpenRoles();
			response.render("index", {
				demoAuthEnabled: isDemoAuthEnabled(),
				jobRoles,
				errorMessage: null,
			});
		} catch {
			const { isAuthenticated, userEmail } = response.locals;

	response.render("index", {
				isAuthenticated,
		userEmail,
				jobRoles: [],
				errorMessage:
					"Something went wrong loading job roles. Please try again later.",
			});
		}
	}
}
