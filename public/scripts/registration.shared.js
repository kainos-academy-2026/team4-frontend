export const createRegistrationPayload = (email, password) => ({
	email: String(email).trim(),
	password: String(password),
});
