export class RegisterServiceError extends Error {
	constructor(
		public readonly status: 400 | 409 | 500,
		message: string,
	) {
		super(message);
		this.name = "RegisterServiceError";
	}
}
