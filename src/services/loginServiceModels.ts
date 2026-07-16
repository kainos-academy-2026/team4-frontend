export interface LoginPayload {
	email: string;
	password: string;
}

export interface LoginResult {
	accessToken?: string;
	email?: string;
	[key: string]: unknown;
}
export interface LoginPayload {
	email: string;
	password: string;
}

export interface LoginResult {
	token?: string;
	email?: string;
	[key: string]: unknown;
}
