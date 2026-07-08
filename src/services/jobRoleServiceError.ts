export type JobRoleServiceErrorCode =
	| "NOT_FOUND"
	| "BACKEND_ERROR"
	| "NETWORK_ERROR"
	| "UNKNOWN_ERROR";

export class JobRoleServiceError extends Error {
	readonly code: JobRoleServiceErrorCode;
	readonly status: number | undefined;

	constructor(message: string, code: JobRoleServiceErrorCode, status?: number) {
		super(message);
		this.name = "JobRoleServiceError";
		this.code = code;
		this.status = status;
	}
}
