export interface RegisterUserPayload {
	email: string;
	password: string;
}

export interface RegisteredUser {
	id: string;
	email: string;
	role: string;
}
