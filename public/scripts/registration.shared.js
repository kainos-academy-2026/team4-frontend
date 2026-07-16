const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createRegistrationPayload = (email, password) => ({
	email: String(email).trim(),
	password: String(password),
});

export const registerUser = async (
	payload,
	fetchImpl = globalThis.fetch,
) => {
	const response = await fetchImpl("/auth/register", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	return response.status;
};

export const validateRegistrationInput = (email, password) => {
	const normalizedEmail = String(email).trim();
	const normalizedPassword = String(password);

	const emailError = emailPattern.test(normalizedEmail)
		? ""
		: "Enter a valid email address.";

	const hasMinimumLength = normalizedPassword.length >= 8;
	const hasUppercase = /[A-Z]/.test(normalizedPassword);
	const hasLowercase = /[a-z]/.test(normalizedPassword);
	const hasSpecialCharacter = /[^A-Za-z0-9]/.test(normalizedPassword);

	const passwordError =
		hasMinimumLength && hasUppercase && hasLowercase && hasSpecialCharacter
			? ""
			: "Password must be at least 8 characters and include uppercase, lowercase, and a special character.";

	return {
		emailError,
		passwordError,
		isValid: emailError.length === 0 && passwordError.length === 0,
	};
};

export const mapRegistrationStatusToMessage = (statusCode) => {
	if (statusCode === 201) {
		return {
			variant: "success",
			message: "Registration Successful, redirecting you to the login page",
			cta: null,
		};
	}

	if (statusCode === 400) {
		return {
			variant: "error",
			message: "Your registration details are invalid. Check your email and password and try again.",
			cta: null,
		};
	}

	if (statusCode === 409) {
		return {
			variant: "error",
			message: "That email is already registered. Try logging in or use a different email.",
			cta: null,
		};
	}

	if (statusCode === 500) {
		return {
			variant: "error",
			message: "Something went wrong on our side. Please try again in a moment.",
			cta: null,
		};
	}

	return {
		variant: "error",
		message: "Something went wrong. Please try again.",
		cta: null,
	};
};
