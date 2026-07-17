import { describe, expect, it, vi } from "vitest";

import { JobApplicationService } from "../../src/services/jobApplicationService";

vi.mock("../../src/config/apiClient");

const makePayload = () => ({
	s3Key: "cvs/1/user-id/uuid-cv.pdf",
	cvFileName: "cv.pdf",
	cvMimeType: "application/pdf",
	cvSizeBytes: 10,
});

describe("JobApplicationService", () => {
	describe("getUploadUrl", () => {
		it("returns presignedUrl and s3Key from the backend", async () => {
			const mockClient = {
				get: vi.fn().mockResolvedValue({
					data: { presignedUrl: "https://s3.example.com/signed", s3Key: "cvs/1/uid/uuid.pdf" },
				}),
			};

			const service = new JobApplicationService(mockClient as never);
			const result = await service.getUploadUrl(1, "Bearer token", "cv.pdf");

			expect(result).toEqual({
				presignedUrl: "https://s3.example.com/signed",
				s3Key: "cvs/1/uid/uuid.pdf",
			});
			expect(mockClient.get).toHaveBeenCalledWith(
				"/job-roles/1/applications/upload-url",
				expect.objectContaining({
					params: { fileName: "cv.pdf" },
					headers: expect.objectContaining({ Authorization: "Bearer token" }),
				}),
			);
		});

		it("propagates errors from the client", async () => {
			const mockClient = {
				get: vi.fn().mockRejectedValue(new Error("network failure")),
			};

			const service = new JobApplicationService(mockClient as never);
			await expect(service.getUploadUrl(1, "Bearer token", "cv.pdf")).rejects.toThrow("network failure");
		});
	});

	describe("submitApplication", () => {
		it("returns status and data on successful submission", async () => {
			const mockClient = {
				post: vi.fn().mockResolvedValue({
					status: 201,
					data: { id: 1, status: "in_progress" },
				}),
			};

			const service = new JobApplicationService(mockClient as never);
			const result = await service.submitApplication(1, "Bearer token", makePayload());

			expect(result).toEqual({ status: 201, data: { id: 1, status: "in_progress" } });
			expect(mockClient.post).toHaveBeenCalledWith(
				"/job-roles/1/applications",
				makePayload(),
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
			await service.submitApplication(99, "Bearer token", makePayload());

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
			await expect(service.submitApplication(1, "Bearer token", makePayload())).rejects.toThrow("upload failed");
		});
	});
});
