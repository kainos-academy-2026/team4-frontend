import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { JobRoleController } from "../../src/controllers/jobRoleController";
import type { JobRole } from "../../src/models/jobRole";
import type { JobApplicationService } from "../../src/services/jobApplicationService";
import type { JobRoleService } from "../../src/services/jobRoleService";

const openRole: JobRole = {
	id: 1,
	roleName: "Software Engineer",
	location: "Belfast",
	capability: "Engineering",
	band: "Associate",
	closingDate: new Date("2026-08-01"),
	status: "open",
	description: "Build services",
	responsibilities: "Ship features",
	sharepointUrl: "https://example.com/role/1",
	numberOfOpenPositions: 2,
	myApplication: null,
};

const closedRole: JobRole = {
	...openRole,
	status: "closed",
};

const createResponse = () => {
	const response = {
		locals: {},
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		render: vi.fn().mockReturnThis(),
		redirect: vi.fn().mockReturnThis(),
	} as unknown as Response;

	return response as Response & {
		status: ReturnType<typeof vi.fn>;
		json: ReturnType<typeof vi.fn>;
		render: ReturnType<typeof vi.fn>;
		redirect: ReturnType<typeof vi.fn>;
	};
};

const createController = (overrides?: {
	getRoleById?: ReturnType<typeof vi.fn>;
	getUploadUrl?: ReturnType<typeof vi.fn>;
	submitApplication?: ReturnType<typeof vi.fn>;
}) => {
	const jobRoleService = {
		getRoleById: overrides?.getRoleById ?? vi.fn(),
	} as unknown as JobRoleService;
	const jobApplicationService = {
		getUploadUrl: overrides?.getUploadUrl ?? vi.fn(),
		submitApplication: overrides?.submitApplication ?? vi.fn(),
	} as unknown as JobApplicationService;

	return {
		controller: new JobRoleController(jobRoleService, jobApplicationService),
		jobRoleService,
		jobApplicationService,
	};
};

describe("JobRoleController", () => {
	it("renderDetailPage redirects to 404 when id is invalid", async () => {
		const { controller } = createController();
		const response = createResponse();

		await controller.renderDetailPage(
			{ params: { id: "bad" }, cookies: {} } as unknown as Request,
			response,
		);

		expect(response.redirect).toHaveBeenCalledWith("/404");
	});

	it("renderDetailPage renders detail model when role is found", async () => {
		const getRoleById = vi
			.fn()
			.mockResolvedValue({ ...openRole, myApplication: { status: "in_progress" } });
		const { controller } = createController({ getRoleById });
		const response = createResponse();

		await controller.renderDetailPage(
			{ params: { id: "1" }, cookies: { access_token: "token" } } as unknown as Request,
			response,
		);

		expect(getRoleById).toHaveBeenCalledWith(1, "Bearer token");
		expect(response.render).toHaveBeenCalledWith("job-role-detail", {
			jobRole: { ...openRole, myApplication: { status: "in_progress" } },
			showApplyForRole: true,
			hasApplicationInProgress: true,
			isLoggedIn: true,
		});
	});

	it("renderDetailPage redirects when role is missing", async () => {
		const getRoleById = vi.fn().mockResolvedValue(null);
		const { controller } = createController({ getRoleById });
		const response = createResponse();

		await controller.renderDetailPage(
			{ params: { id: "1" }, cookies: {} } as unknown as Request,
			response,
		);

		expect(response.redirect).toHaveBeenCalledWith("/404");
	});

	it("renderDetailPage renders error state on failure", async () => {
		const getRoleById = vi.fn().mockRejectedValue(new Error("boom"));
		const { controller } = createController({ getRoleById });
		const response = createResponse();

		await controller.renderDetailPage(
			{ params: { id: "1" }, cookies: {} } as unknown as Request,
			response,
		);

		expect(response.render).toHaveBeenCalledWith("job-role-detail", {
			errorMessage: "Something went wrong. Please try again later.",
			jobRole: null,
			showApplyForRole: false,
			hasApplicationInProgress: false,
		});
	});

	it("renderApplicationPage renders submitted status for new application", async () => {
		const getRoleById = vi.fn().mockResolvedValue(openRole);
		const { controller } = createController({ getRoleById });
		const response = createResponse();

		await controller.renderApplicationPage(
			{
				params: { id: "1" },
				cookies: { access_token: "token" },
				query: { submitted: "true", updated: "false", cvFileName: "mycv.pdf" },
			} as unknown as Request,
			response,
		);

		expect(response.render).toHaveBeenCalledWith("job-role-application", {
			errorMessage: null,
			jobRole: openRole,
			canApply: true,
			existingApplicationStatus: null,
			submissionStatus: {
				heading: "Application submitted",
				text: "Status: in progress. CV uploaded: mycv.pdf",
			},
			isLoggedIn: true,
		});
	});

	it("renderApplicationPage renders updated status for existing application", async () => {
		const roleWithApp: JobRole = {
			...openRole,
			myApplication: { status: "in_progress", cvFileName: "old.pdf" },
		};
		const getRoleById = vi.fn().mockResolvedValue(roleWithApp);
		const { controller } = createController({ getRoleById });
		const response = createResponse();

		await controller.renderApplicationPage(
			{
				params: { id: "1" },
				cookies: {},
				query: { submitted: "true", updated: "true" },
			} as unknown as Request,
			response,
		);

		expect(response.render).toHaveBeenCalledWith("job-role-application", {
			errorMessage: null,
			jobRole: roleWithApp,
			canApply: true,
			existingApplicationStatus: {
				status: "in_progress",
				cvFileName: "old.pdf",
			},
			submissionStatus: {
				heading: "CV Updated",
				text: undefined,
			},
			isLoggedIn: false,
		});
	});

	it("renderApplicationPage shows closed message when role is closed", async () => {
		const getRoleById = vi.fn().mockResolvedValue(closedRole);
		const { controller } = createController({ getRoleById });
		const response = createResponse();

		await controller.renderApplicationPage(
			{ params: { id: "1" }, cookies: {}, query: {} } as unknown as Request,
			response,
		);

		expect(response.render).toHaveBeenCalledWith("job-role-application", {
			errorMessage: "Applications are closed for this role.",
			jobRole: closedRole,
			canApply: false,
			existingApplicationStatus: null,
			submissionStatus: null,
			isLoggedIn: false,
		});
	});

	it("renderApplicationPage renders server-error when service throws", async () => {
		const getRoleById = vi.fn().mockRejectedValue(new Error("boom"));
		const { controller } = createController({ getRoleById });
		const response = createResponse();

		await controller.renderApplicationPage(
			{ params: { id: "1" }, cookies: {}, query: {} } as unknown as Request,
			response,
		);

		expect(response.status).toHaveBeenCalledWith(500);
		expect(response.render).toHaveBeenCalledWith("server-error", {
			title: "Something went wrong",
			message: "Please try again later.",
		});
	});

	it("getUploadUrl validates request and defaults fileName", async () => {
		const getUploadUrl = vi
			.fn()
			.mockResolvedValue({ presignedUrl: "https://example.com", s3Key: "k" });
		const { controller } = createController({ getUploadUrl });
		const response = createResponse();

		await controller.getUploadUrl(
			{
				params: { id: "1" },
				cookies: { access_token: "token" },
				query: {},
			} as unknown as Request,
			response,
		);

		expect(getUploadUrl).toHaveBeenCalledWith(1, "Bearer token", "cv", "");
		expect(response.json).toHaveBeenCalledWith({
			presignedUrl: "https://example.com",
			s3Key: "k",
		});
	});

	it("getUploadUrl forwards custom fileName and mimeType query params", async () => {
		const getUploadUrl = vi
			.fn()
			.mockResolvedValue({ presignedUrl: "https://example.com/custom", s3Key: "k2" });
		const { controller } = createController({ getUploadUrl });
		const response = createResponse();

		await controller.getUploadUrl(
			{
				params: { id: "1" },
				cookies: { access_token: "token" },
				query: { fileName: "resume.pdf", mimeType: "application/pdf" },
			} as unknown as Request,
			response,
		);

		expect(getUploadUrl).toHaveBeenCalledWith(
			1,
			"Bearer token",
			"resume.pdf",
			"application/pdf",
		);
	});

	it("getUploadUrl returns 400 for invalid id", async () => {
		const { controller } = createController();
		const response = createResponse();

		await controller.getUploadUrl(
			{ params: { id: "bad" }, cookies: {}, query: {} } as unknown as Request,
			response,
		);

		expect(response.status).toHaveBeenCalledWith(400);
		expect(response.json).toHaveBeenCalledWith({ message: "Invalid job role ID." });
	});

	it("getUploadUrl returns 401 when no token is provided", async () => {
		const { controller } = createController();
		const response = createResponse();

		await controller.getUploadUrl(
			{ params: { id: "1" }, cookies: {}, query: {} } as unknown as Request,
			response,
		);

		expect(response.status).toHaveBeenCalledWith(401);
		expect(response.json).toHaveBeenCalledWith({ message: "Unauthorised." });
	});

	it("getUploadUrl maps backend 400 with backend message", async () => {
		const getUploadUrl = vi.fn().mockRejectedValue({
			isAxiosError: true,
			response: { status: 400, data: { message: "Bad upload" } },
		});
		const { controller } = createController({ getUploadUrl });
		const response = createResponse();

		await controller.getUploadUrl(
			{ params: { id: "1" }, cookies: { access_token: "token" }, query: {} } as unknown as Request,
			response,
		);

		expect(response.status).toHaveBeenCalledWith(400);
		expect(response.json).toHaveBeenCalledWith({ message: "Bad upload" });
	});

	it("getUploadUrl falls back to generic 400 message when backend message is absent", async () => {
		const getUploadUrl = vi.fn().mockRejectedValue({
			isAxiosError: true,
			response: { status: 400, data: null },
		});
		const { controller } = createController({ getUploadUrl });
		const response = createResponse();

		await controller.getUploadUrl(
			{ params: { id: "1" }, cookies: { access_token: "token" }, query: {} } as unknown as Request,
			response,
		);

		expect(response.status).toHaveBeenCalledWith(400);
		expect(response.json).toHaveBeenCalledWith({
			message: "Could not prepare upload. Please try again.",
		});
	});

	it("getUploadUrl maps backend auth and not found errors", async () => {
		const response401 = createResponse();
		const getUploadUrl401 = vi.fn().mockRejectedValue({
			isAxiosError: true,
			response: { status: 401, data: {} },
		});
		const { controller: controller401 } = createController({
			getUploadUrl: getUploadUrl401,
		});

		await controller401.getUploadUrl(
			{ params: { id: "1" }, cookies: { access_token: "token" }, query: {} } as unknown as Request,
			response401,
		);
		expect(response401.status).toHaveBeenCalledWith(401);
		expect(response401.json).toHaveBeenCalledWith({ message: "Unauthorised." });

		const response404 = createResponse();
		const getUploadUrl404 = vi.fn().mockRejectedValue({
			isAxiosError: true,
			response: { status: 404, data: {} },
		});
		const { controller: controller404 } = createController({
			getUploadUrl: getUploadUrl404,
		});

		await controller404.getUploadUrl(
			{ params: { id: "1" }, cookies: { access_token: "token" }, query: {} } as unknown as Request,
			response404,
		);
		expect(response404.status).toHaveBeenCalledWith(404);
		expect(response404.json).toHaveBeenCalledWith({ message: "Job role not found." });
	});

	it("getUploadUrl maps backend and unknown failures to 502", async () => {
		const responseBackend = createResponse();
		const getUploadUrlBackend = vi.fn().mockRejectedValue({
			isAxiosError: true,
			response: { status: 500, data: {} },
		});
		const { controller: controllerBackend } = createController({
			getUploadUrl: getUploadUrlBackend,
		});

		await controllerBackend.getUploadUrl(
			{ params: { id: "1" }, cookies: { access_token: "token" }, query: {} } as unknown as Request,
			responseBackend,
		);
		expect(responseBackend.status).toHaveBeenCalledWith(502);

		const responseUnknown = createResponse();
		const getUploadUrlUnknown = vi.fn().mockRejectedValue(new Error("boom"));
		const { controller: controllerUnknown } = createController({
			getUploadUrl: getUploadUrlUnknown,
		});

		await controllerUnknown.getUploadUrl(
			{ params: { id: "1" }, cookies: { access_token: "token" }, query: {} } as unknown as Request,
			responseUnknown,
		);
		expect(responseUnknown.status).toHaveBeenCalledWith(502);
		expect(responseUnknown.json).toHaveBeenCalledWith({
			message: "Could not prepare upload. Please try again.",
		});
	});

	it("submitApplicationPage validates invalid id, role not found and closed roles", async () => {
		const responseInvalid = createResponse();
		const { controller: invalidController } = createController();
		await invalidController.submitApplicationPage(
			{ params: { id: "bad" }, body: {}, cookies: {} } as unknown as Request,
			responseInvalid,
		);
		expect(responseInvalid.status).toHaveBeenCalledWith(400);

		const responseMissing = createResponse();
		const getRoleByIdMissing = vi.fn().mockResolvedValue(null);
		const { controller: missingController } = createController({
			getRoleById: getRoleByIdMissing,
		});
		await missingController.submitApplicationPage(
			{ params: { id: "1" }, body: {}, cookies: {} } as unknown as Request,
			responseMissing,
		);
		expect(responseMissing.status).toHaveBeenCalledWith(404);

		const responseClosed = createResponse();
		const getRoleByIdClosed = vi.fn().mockResolvedValue(closedRole);
		const { controller: closedController } = createController({
			getRoleById: getRoleByIdClosed,
		});
		await closedController.submitApplicationPage(
			{ params: { id: "1" }, body: {}, cookies: {} } as unknown as Request,
			responseClosed,
		);
		expect(responseClosed.status).toHaveBeenCalledWith(400);
	});

	it("submitApplicationPage handles auth, validation and authenticated lookup checks", async () => {
		const { controller: authController } = createController({
			getRoleById: vi.fn().mockResolvedValue(openRole),
		});

		const responseNoAuth = createResponse();
		await authController.submitApplicationPage(
			{
				params: { id: "1" },
				body: { s3Key: "k", cvFileName: "cv.pdf", cvMimeType: "application/pdf" },
				cookies: {},
			} as unknown as Request,
			responseNoAuth,
		);
		expect(responseNoAuth.status).toHaveBeenCalledWith(401);

		const { controller: validationController } = createController({
			getRoleById: vi.fn().mockResolvedValue(openRole),
		});
		const responseMissingFields = createResponse();
		await validationController.submitApplicationPage(
			{
				params: { id: "1" },
				body: {},
				cookies: { access_token: "token" },
			} as unknown as Request,
			responseMissingFields,
		);
		expect(responseMissingFields.status).toHaveBeenCalledWith(400);

		const responseMissingFileName = createResponse();
		await validationController.submitApplicationPage(
			{
				params: { id: "1" },
				body: { s3Key: "k", cvMimeType: "application/pdf" },
				cookies: { access_token: "token" },
			} as unknown as Request,
			responseMissingFileName,
		);
		expect(responseMissingFileName.status).toHaveBeenCalledWith(400);

		const responseMissingMimeType = createResponse();
		await validationController.submitApplicationPage(
			{
				params: { id: "1" },
				body: { s3Key: "k", cvFileName: "cv.pdf" },
				cookies: { access_token: "token" },
			} as unknown as Request,
			responseMissingMimeType,
		);
		expect(responseMissingMimeType.status).toHaveBeenCalledWith(400);

		const responseUndefinedBody = createResponse();
		await validationController.submitApplicationPage(
			{
				params: { id: "1" },
				cookies: { access_token: "token" },
				body: undefined,
			} as unknown as Request,
			responseUndefinedBody,
		);
		expect(responseUndefinedBody.status).toHaveBeenCalledWith(400);

		const { controller: lookupController } = createController({
			getRoleById: vi
				.fn()
				.mockResolvedValueOnce(openRole)
				.mockResolvedValueOnce(null),
		});
		const responseAuthMissing = createResponse();
		await lookupController.submitApplicationPage(
			{
				params: { id: "1" },
				body: { s3Key: "k", cvFileName: "cv.pdf", cvMimeType: "application/pdf" },
				cookies: { access_token: "token" },
			} as unknown as Request,
			responseAuthMissing,
		);
		expect(responseAuthMissing.status).toHaveBeenCalledWith(404);
	});

	it("submitApplicationPage returns redirect URL for new and updated applications", async () => {
		const submitApplication = vi.fn().mockResolvedValue({ status: 201, data: {} });
		const getRoleById = vi
			.fn()
			.mockResolvedValueOnce(openRole)
			.mockResolvedValueOnce(openRole)
			.mockResolvedValueOnce(openRole)
			.mockResolvedValueOnce({
				...openRole,
				myApplication: { status: "in_progress", cvFileName: "old.pdf" },
			});
		const { controller } = createController({ getRoleById, submitApplication });

		const responseNew = createResponse();
		await controller.submitApplicationPage(
			{
				params: { id: "1" },
				body: {
					s3Key: "k",
					cvFileName: "cv.pdf",
					cvMimeType: "application/pdf",
					cvSizeBytes: 100,
				},
				cookies: { access_token: "token" },
			} as unknown as Request,
			responseNew,
		);
		expect(responseNew.json).toHaveBeenCalledWith({
			redirectUrl: "/job-roles/1/apply?submitted=true&updated=false&cvFileName=cv.pdf",
		});

		const responseUpdated = createResponse();
		await controller.submitApplicationPage(
			{
				params: { id: "1" },
				body: {
					s3Key: "k2",
					cvFileName: "cv2.pdf",
					cvMimeType: "application/pdf",
				},
				cookies: { access_token: "token" },
			} as unknown as Request,
			responseUpdated,
		);
		expect(responseUpdated.json).toHaveBeenCalledWith({
			redirectUrl: "/job-roles/1/apply?submitted=true&updated=true&cvFileName=cv2.pdf",
		});
	});

	it("submitApplicationPage maps backend and unknown failures", async () => {
		const getRoleById = vi.fn().mockResolvedValue(openRole);
		const response401 = createResponse();
		const submitApplication401 = vi.fn().mockRejectedValue({
			isAxiosError: true,
			response: { status: 401, data: {} },
		});
		const { controller: c401 } = createController({
			getRoleById: vi.fn().mockResolvedValue(openRole),
			submitApplication: submitApplication401,
		});
		await c401.submitApplicationPage(
			{
				params: { id: "1" },
				body: { s3Key: "k", cvFileName: "cv.pdf", cvMimeType: "application/pdf" },
				cookies: { access_token: "token" },
			} as unknown as Request,
			response401,
		);
		expect(response401.status).toHaveBeenCalledWith(401);

		const response404 = createResponse();
		const submitApplication404 = vi.fn().mockRejectedValue({
			isAxiosError: true,
			response: { status: 404, data: {} },
		});
		const { controller: c404 } = createController({
			getRoleById,
			submitApplication: submitApplication404,
		});
		await c404.submitApplicationPage(
			{
				params: { id: "1" },
				body: { s3Key: "k", cvFileName: "cv.pdf", cvMimeType: "application/pdf" },
				cookies: { access_token: "token" },
			} as unknown as Request,
			response404,
		);
		expect(response404.status).toHaveBeenCalledWith(404);

		const response422 = createResponse();
		const submitApplication422 = vi.fn().mockRejectedValue({
			isAxiosError: true,
			response: { status: 422, data: { message: "Invalid file type." } },
		});
		const { controller: c422 } = createController({
			getRoleById,
			submitApplication: submitApplication422,
		});
		await c422.submitApplicationPage(
			{
				params: { id: "1" },
				body: { s3Key: "k", cvFileName: "cv.pdf", cvMimeType: "application/pdf" },
				cookies: { access_token: "token" },
			} as unknown as Request,
			response422,
		);
		expect(response422.status).toHaveBeenCalledWith(422);
		expect(response422.json).toHaveBeenCalledWith({ message: "Invalid file type." });

		const responseAxiosNoBody = createResponse();
		const submitApplicationAxiosNoBody = vi.fn().mockRejectedValue({
			isAxiosError: true,
		});
		const { controller: cAxiosNoBody } = createController({
			getRoleById,
			submitApplication: submitApplicationAxiosNoBody,
		});
		await cAxiosNoBody.submitApplicationPage(
			{
				params: { id: "1" },
				body: { s3Key: "k", cvFileName: "cv.pdf", cvMimeType: "application/pdf" },
				cookies: { access_token: "token" },
			} as unknown as Request,
			responseAxiosNoBody,
		);
		expect(responseAxiosNoBody.status).toHaveBeenCalledWith(502);
		expect(responseAxiosNoBody.json).toHaveBeenCalledWith({
			message: "CV upload failed. Please try again later.",
		});

		const responseUnknown = createResponse();
		const submitApplicationUnknown = vi.fn().mockRejectedValue(new Error("boom"));
		const { controller: cUnknown } = createController({
			getRoleById,
			submitApplication: submitApplicationUnknown,
		});
		await cUnknown.submitApplicationPage(
			{
				params: { id: "1" },
				body: { s3Key: "k", cvFileName: "cv.pdf", cvMimeType: "application/pdf" },
				cookies: { access_token: "token" },
			} as unknown as Request,
			responseUnknown,
		);
		expect(responseUnknown.status).toHaveBeenCalledWith(502);
	});

	it("submitApplication validates request and forwards backend response", async () => {
		const submitApplication = vi
			.fn()
			.mockResolvedValue({ status: 201, data: { id: 9, status: "in_progress" } });
		const { controller } = createController({ submitApplication });

		const invalid = createResponse();
		await controller.submitApplication(
			{ params: { id: "bad" }, cookies: {}, body: {} } as unknown as Request,
			invalid,
		);
		expect(invalid.status).toHaveBeenCalledWith(404);

		const missingToken = createResponse();
		await controller.submitApplication(
			{ params: { id: "1" }, cookies: {}, body: {} } as unknown as Request,
			missingToken,
		);
		expect(missingToken.status).toHaveBeenCalledWith(401);

		const missingFields = createResponse();
		await controller.submitApplication(
			{ params: { id: "1" }, cookies: { access_token: "token" }, body: {} } as unknown as Request,
			missingFields,
		);
		expect(missingFields.status).toHaveBeenCalledWith(400);

		const missingFileName = createResponse();
		await controller.submitApplication(
			{
				params: { id: "1" },
				cookies: { access_token: "token" },
				body: { s3Key: "k", cvMimeType: "application/pdf" },
			} as unknown as Request,
			missingFileName,
		);
		expect(missingFileName.status).toHaveBeenCalledWith(400);

		const missingMimeType = createResponse();
		await controller.submitApplication(
			{
				params: { id: "1" },
				cookies: { access_token: "token" },
				body: { s3Key: "k", cvFileName: "cv.pdf" },
			} as unknown as Request,
			missingMimeType,
		);
		expect(missingMimeType.status).toHaveBeenCalledWith(400);

		const undefinedBody = createResponse();
		await controller.submitApplication(
			{
				params: { id: "1" },
				cookies: { access_token: "token" },
				body: undefined,
			} as unknown as Request,
			undefinedBody,
		);
		expect(undefinedBody.status).toHaveBeenCalledWith(400);

		const success = createResponse();
		await controller.submitApplication(
			{
				params: { id: "1" },
				cookies: { access_token: "token" },
				body: { s3Key: "k", cvFileName: "cv.pdf", cvMimeType: "application/pdf" },
			} as unknown as Request,
			success,
		);
		expect(success.status).toHaveBeenCalledWith(201);
		expect(success.json).toHaveBeenCalledWith({ id: 9, status: "in_progress" });
	});

	it("submitApplication forwards axios errors and maps unknown errors", async () => {
		const responseAxios = createResponse();
		const submitApplicationAxios = vi.fn().mockRejectedValue({
			isAxiosError: true,
			response: { status: 422, data: { message: "Invalid" } },
		});
		const { controller: controllerAxios } = createController({
			submitApplication: submitApplicationAxios,
		});

		await controllerAxios.submitApplication(
			{
				params: { id: "1" },
				cookies: { access_token: "token" },
				body: { s3Key: "k", cvFileName: "cv.pdf", cvMimeType: "application/pdf" },
			} as unknown as Request,
			responseAxios,
		);
		expect(responseAxios.status).toHaveBeenCalledWith(422);
		expect(responseAxios.json).toHaveBeenCalledWith({ message: "Invalid" });

		const responseUnknown = createResponse();
		const submitApplicationUnknown = vi.fn().mockRejectedValue(new Error("boom"));
		const { controller: controllerUnknown } = createController({
			submitApplication: submitApplicationUnknown,
		});

		await controllerUnknown.submitApplication(
			{
				params: { id: "1" },
				cookies: { access_token: "token" },
				body: { s3Key: "k", cvFileName: "cv.pdf", cvMimeType: "application/pdf" },
			} as unknown as Request,
			responseUnknown,
		);
		expect(responseUnknown.status).toHaveBeenCalledWith(502);
		expect(responseUnknown.json).toHaveBeenCalledWith({
			message: "CV upload failed. Please try again later.",
		});
	});
});
