import axios from "axios";
import type { Request, Response } from "express";

import type { JobRole } from "../models/jobRole";
import { jobRoleIdSchema } from "../models/jobRole";
import type { JobApplicationService } from "../services/jobApplicationService";
import type { JobRoleService } from "../services/jobRoleService";

type ApplicationStatusPayload = {
	status?: string;
	cvFileName?: string;
};

export class JobRoleController {
	constructor(
		private readonly jobRoleService: JobRoleService,
		private readonly jobApplicationService: JobApplicationService,
	) {}

	async renderDetailPage(request: Request, response: Response): Promise<void> {
		try {
			const parsedJobRoleId = jobRoleIdSchema.safeParse(request.params.id);

			if (!parsedJobRoleId.success) {
				response.redirect("/404");
				return;
			}

			const authHeader = this.getAuthHeader(request);
			const jobRole = await this.jobRoleService.getRoleById(
				parsedJobRoleId.data,
				authHeader ?? undefined,
			);

			if (!jobRole) {
				response.redirect("/404");
				return;
			}

			response.render("job-role-detail", {
				jobRole,
				showApplyForRole: this.canAcceptApplications(jobRole),
				hasApplicationInProgress: this.hasApplicationInProgress(jobRole),
				isLoggedIn: authHeader !== null,
			});
		} catch (controllerError) {
			console.error(controllerError);
			response.render("job-role-detail", {
				errorMessage: "Something went wrong. Please try again later.",
				jobRole: null,
				showApplyForRole: false,
				hasApplicationInProgress: false,
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

			const authHeader = this.getAuthHeader(request);
			const jobRole = await this.jobRoleService.getRoleById(
				parsedJobRoleId.data,
				authHeader ?? undefined,
			);

			if (!jobRole) {
				response.redirect("/404");
				return;
			}

			const canApply = this.canAcceptApplications(jobRole);
			const existingApplicationStatus = canApply
				? this.getExistingApplicationStatusFromRole(jobRole)
				: null;
			const submissionStatus = this.getSubmissionStatus(request);

			response.render("job-role-application", {
				errorMessage: canApply
					? null
					: "Applications are closed for this role.",
				jobRole,
				canApply,
				existingApplicationStatus,
				submissionStatus,
				isLoggedIn: authHeader !== null,
			});
		} catch (controllerError) {
			console.error(controllerError);
			response.status(500).render("server-error", {
				title: "Something went wrong",
				message: "Please try again later.",
			});
		}
	}

	async submitApplicationPage(
		request: Request,
		response: Response,
	): Promise<void> {
		const parsedJobRoleId = jobRoleIdSchema.safeParse(request.params.id);
		if (!parsedJobRoleId.success) {
			response.redirect("/404");
			return;
		}

		const jobRole = await this.jobRoleService.getRoleById(parsedJobRoleId.data);
		if (!jobRole) {
			response.redirect("/404");
			return;
		}

		const canApply = this.canAcceptApplications(jobRole);
		if (!canApply) {
			response.status(400).render("job-role-application", {
				errorMessage: "Applications are closed for this role.",
				jobRole,
				canApply: false,
				existingApplicationStatus: null,
				submissionStatus: null,
			});
			return;
		}

		const authHeader = this.getAuthHeader(request);
		if (authHeader === null) {
			response.redirect(`/login?returnTo=/job-roles/${jobRole.id}/apply`);
			return;
		}

		const authenticatedJobRole = await this.jobRoleService.getRoleById(
			jobRole.id,
			authHeader,
		);
		if (!authenticatedJobRole) {
			response.redirect("/404");
			return;
		}
		const existingApplicationStatus =
			this.getExistingApplicationStatusFromRole(authenticatedJobRole);

		const file = request.file;
		if (!file) {
			response.status(400).render("job-role-application", {
				errorMessage: "No CV file provided.",
				jobRole,
				canApply: true,
				existingApplicationStatus,
				submissionStatus: null,
			});
			return;
		}

		try {
			await this.jobApplicationService.submitApplication(
				jobRole.id,
				authHeader,
				file,
			);

			const params = new URLSearchParams({
				submitted: "true",
				updated: existingApplicationStatus === null ? "false" : "true",
				cvFileName: file.originalname,
			});
			response.redirect(`/job-roles/${jobRole.id}/apply?${params.toString()}`);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const backendStatus = error.response?.status;
				if (backendStatus === 401) {
					response.redirect(`/login?returnTo=/job-roles/${jobRole.id}/apply`);
					return;
				}

				if (backendStatus === 404) {
					response.redirect("/404");
					return;
				}

				const backendMessage =
					error.response?.data &&
					typeof error.response.data === "object" &&
					"message" in error.response.data &&
					typeof error.response.data.message === "string"
						? error.response.data.message
						: null;

				response.status(backendStatus ?? 502).render("job-role-application", {
					errorMessage:
						backendMessage ?? "CV upload failed. Please try again later.",
					jobRole,
					canApply: true,
					existingApplicationStatus,
					submissionStatus: null,
				});
				return;
			}

			console.error(error);
			response.status(502).render("job-role-application", {
				errorMessage: "CV upload failed. Please try again later.",
				jobRole,
				canApply: true,
				existingApplicationStatus,
				submissionStatus: null,
			});
		}
	}

	async submitApplication(request: Request, response: Response): Promise<void> {
		const parsedJobRoleId = jobRoleIdSchema.safeParse(request.params.id);
		if (!parsedJobRoleId.success) {
			response.status(404).json({ message: "Job role not found." });
			return;
		}

		const token = request.cookies.access_token as string | undefined;
		if (!token) {
			response.status(401).json({ message: "Unauthorised." });
			return;
		}
		const authHeader = `Bearer ${token}`;

		const file = request.file;
		if (!file) {
			response.status(400).json({ message: "No CV file provided." });
			return;
		}

		try {
			const backendResponse =
				await this.jobApplicationService.submitApplication(
					parsedJobRoleId.data,
					authHeader,
					file,
				);
			response.status(backendResponse.status).json(backendResponse.data);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				response.status(error.response.status).json(error.response.data);
				return;
			}
			console.error(error);
			response
				.status(502)
				.json({ message: "CV upload failed. Please try again later." });
		}
	}

	private canAcceptApplications(jobRole: JobRole): boolean {
		return (
			jobRole.status.toLowerCase() === "open" &&
			jobRole.numberOfOpenPositions > 0
		);
	}

	private getAuthHeader(request: Request): string | null {
		const accessToken = request.cookies.access_token as string | undefined;
		if (!accessToken) {
			return null;
		}

		return `Bearer ${accessToken}`;
	}

	private hasApplicationInProgress(jobRole: JobRole): boolean {
		return this.getExistingApplicationStatusFromRole(jobRole) !== null;
	}

	private getExistingApplicationStatusFromRole(
		jobRole: JobRole,
	): ApplicationStatusPayload | null {
		const myApplication = jobRole.myApplication;
		if (!myApplication) {
			return null;
		}
		return {
			status: myApplication.status,
			cvFileName: myApplication.cvFileName,
		};
	}

	private getSubmissionStatus(request: Request): {
		heading: string;
		text?: string;
	} | null {
		const submitted = request.query.submitted;
		if (submitted !== "true") {
			return null;
		}

		const updated = request.query.updated === "true";
		const cvFileName =
			typeof request.query.cvFileName === "string" &&
			request.query.cvFileName.length > 0
				? request.query.cvFileName
				: "uploaded CV";

		const heading = updated ? "CV Updated" : "Application submitted";
		const text = updated
			? undefined
			: `Status: in progress. CV uploaded: ${cvFileName}`;

		return {
			heading,
			text,
		};
	}
}
