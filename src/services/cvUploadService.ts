import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export class CvUploadService {
	private readonly s3: S3Client;
	private readonly bucketName: string;

	constructor(
		region: string = process.env.AWS_REGION ?? "eu-west-1",
		bucketName: string = process.env.AWS_S3_BUCKET_NAME ?? "",
	) {
		this.s3 = new S3Client({ region });
		this.bucketName = bucketName;
	}

	async uploadCv(
		jobRoleId: number,
		applicantEmail: string,
		file: Express.Multer.File,
	): Promise<string> {
		const key = `applications/${jobRoleId}/${Date.now()}-${applicantEmail}-${file.originalname}`;

		await this.s3.send(
			new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: file.buffer,
				ContentType: file.mimetype,
			}),
		);

		return key;
	}
}
