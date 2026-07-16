import { describe, expect, it, vi } from "vitest";

import { JobApplicationService } from "../../src/services/jobApplicationService";

vi.mock("../../src/config/apiClient");

const makeFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File =>
	({
		buffer: Buffer.from("cv content"),
		originalname: "cv.pdf",
		mimetype: "application/pdf",
		size: 10,
		fieldname: "cvFile",
		encoding: "7bit",
		path: "",
		filename: "",
		destination: "",
		stream: null,
		...overrides,
	}) as unknown as Express.Multer.File;

describe("JobApplicationService", () => {
	describe("submitApplication", () => {
		it("returns status and data on successful submission", async () => {
			const mockClient = {
				post: vi.fn().mockResolvedValue({
					status: 201,
					data: { id: 1, status: "in_progress" },
				}),
			};

			const service = new JobApplicationService(mockClient as never);
			const result = await service.submitApplication(1, "Bearer token", makeFile());

			expect(result).toEqual({ status: 201, data: { id: 1, status: "in_progress" } });
			expect(mockClient.post).toHaveBeenCalledWith(
				"/job-roles/1/applications",
				expect.any(Object),
				expect.objectContaining({
					headers: expect.objectContaining({ Authorization: "Bearer token" }),
				}),
			);
		});

		it("uses the correct role ID in the request URL", async () => {
			const mockClient = {
				post: vi.fn().mockResolvedValue({ status: 201, data: {} }),
			};

			const service = new JobApplicationService(mockClient as never);
			await service.submitApplication(99, "Bearer token", makeFile());

			expect(mockClient.post).toHaveBeenCalledWith(
				"/job-roles/99/applications",
				expect.any(Object),
				expect.any(Object),
			);
		});

		it("propagates errors from the client", async () => {
			const mockClient = {
				post: vi.fn().mockRejectedValue(new Error("upload failed")),
			};

			const service = new JobApplicationService(mockClient as never);
			await expect(service.submitApplication(1, "Bearer token", makeFile())).rejects.toThrow(
				"upload failed",
			);
		});
	});

	describe("getApplicationStatus", () => {
		it("returns application data when found", async () => {
			const mockClient = {
				get: vi.fn().mockResolvedValue({
					data: { id: 10, status: "in_progress" },
				}),
			};

			const service = new JobApplicationService(mockClient as never);
			const result = await service.getApplicationStatus(1, "Bearer token");

			expect(result).toEqual({ id: 10, status: "in_progress" });
			expect(mockClient.get).toHaveBeenCalledWith("/job-roles/1/applications/me", {
				headers: { Authorization: "Bearer token" },
			});
		});

		it("uses the correct role ID in the request URL", async () => {
			const mockClient = {
				get: vi.fn().mockResolvedValue({ data: {} }),
			};

			const service = new JobApplicationService(mockClient as never);
			await service.getApplicationStatus(55, "Bearer token");

			expect(mockClient.get).toHaveBeenCalledWith(
				"/job-roles/55/applications/me",
				expect.any(Object),
			);
		});

		it("propagates axios 404 errors from the client", async () => {
			const mockClient = {
				get: vi.fn().mockRejectedValue({
					isAxiosError: true,
					response: { status: 404 },
				}),
			};

			const service = new JobApplicationService(mockClient as never);
			await expect(service.getApplicationStatus(1, "Bearer token")).rejects.toMatchObject({
				isAxiosError: true,
				response: { status: 404 },
			});
		});
	});
});
