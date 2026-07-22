export const createRegistrationPayload = (email, password) => ({
	email: String(email).trim(),
	password: String(password),
});

export const passwordRequirements = [
	{
		key: "length",
		label: "At least 8 characters",
		test: (value) => value.length >= 8,
	},
	{
		key: "uppercase",
		label: "An uppercase letter",
		test: (value) => /[A-Z]/.test(value),
	},
	{
		key: "lowercase",
		label: "A lowercase letter",
		test: (value) => /[a-z]/.test(value),
	},
	{
		key: "special",
		label: "A special character",
		test: (value) => /[^A-Za-z0-9]/.test(value),
	},
];

export const isPasswordValid = (password) =>
	passwordRequirements.every((requirement) => requirement.test(password));

