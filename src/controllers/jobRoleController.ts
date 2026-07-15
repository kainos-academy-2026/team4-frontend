import type { Request, Response } from "express";

import type { JobRole } from "../models/jobRole";
import type { JobRole } from "../models/jobRole";
import { jobRoleIdSchema } from "../models/jobRole";
import type { JobApplicationService } from "../services/jobApplicationService";
import apiClient from "../config/apiClient.js";
import type { JobRoleService } from "../services/jobRoleService";

export class JobRoleController {
	constructor(
		
		private readonly jobRoleService: JobRoleService,
		private readonly jobApplicationService: JobApplicationService,
	,
		private readonly backendClient: AxiosInstance = apiClient,
	) {}

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
				showApplyForRole: false,
			});
		}
	}

	async submitApplication(
		request: Request,
		response: Response,
	): Promise<void> {
		const parsedJobRoleId = jobRoleIdSchema.safeParse(request.params.id);
		if (!parsedJobRoleId.success) {
			response.status(404).json({ message: "Job role not found." });
			return;
		}

		const authHeader = request.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			response.status(401).json({ message: "Unauthorised." });
			return;
		}

		const file = request.file;
		if (!file) {
			response.status(400).json({ message: "No CV file provided." });
			return;
		}

		try {
			const formData = new FormData();
			formData.append("cvFile", file.buffer, {
				filename: file.originalname,
				contentType: file.mimetype,
				knownLength: file.size,
			});

			const backendResponse = await this.backendClient.post(
				`/job-roles/${parsedJobRoleId.data}/applications`,
				formData,
				{ headers: { Authorization: authHeader, ...formData.getHeaders() } },
			);

			response.status(backendResponse.status).json(backendResponse.data);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				response.status(error.response.status).json(error.response.data);
				return;
			}
			console.error(error);
			response.status(502).json({ message: "CV upload failed. Please try again later." });
		}
	}

	async getApplicationStatus(
		request: Request,
		response: Response,
	): Promise<void> {
		const parsedJobRoleId = jobRoleIdSchema.safeParse(request.params.id);
		if (!parsedJobRoleId.success) {
			response.status(404).json({ message: "Job role not found." });
			return;
		}

		const authHeader = request.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			response.status(401).json({ message: "Unauthorised." });
			return;
		}

		try {
			const backendResponse = await this.backendClient.get(
				`/job-roles/${parsedJobRoleId.data}/applications/me`,
				{ headers: { Authorization: authHeader } },
			);
			response.status(200).json(backendResponse.data);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				if (status === 401) {
					response.status(401).json({ message: "Unauthorised." });
					return;
				}
				if (status === 404) {
					response.status(404).json({ message: "No application found." });
					return;
				}
			}
			console.error(error);
			response.status(502).json({ message: "Unable to retrieve application status." });
		}
	}

	private canAcceptApplications(jobRole: JobRole): boolean {
		return (
			jobRole.status.toLowerCase() === "open" &&
			jobRole.numberOfOpenPositions > 0
		);
	}
}
