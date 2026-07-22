import { z } from "zod";

export const SubmitApplicationBodySchema = z.object({
	s3Key: z.string().min(1),
	cvFileName: z.string().min(1),
	cvMimeType: z.string().min(1),
	cvSizeBytes: z.number().optional(),
});

export const UploadUrlQuerySchema = z.object({
	fileName: z.string().min(1).default("cv"),
	mimeType: z.string().default(""),
});
