export type RegistrationStatusResponse = {
	variant: "success" | "error";
	message: string;
};

export const mapRegistrationStatusToResponse = (
	statusCode: number,
): RegistrationStatusResponse => {
	if (statusCode === 201) {
		return {
			variant: "success",
			message: "Registration Successful, redirecting you to the login page",
		};
	}

	if (statusCode === 400) {
		return {
			variant: "error",
			message:
				"Your registration details are invalid. Check your email and password and try again.",
		};
	}

	if (statusCode === 409) {
		return {
			variant: "error",
			message:
				"That email is already registered. Try logging in or use a different email.",
		};
	}

	if (statusCode === 500) {
		return {
			variant: "error",
			message:
				"Something went wrong on our side. Please try again in a moment.",
		};
	}

	return {
		variant: "error",
		message: "Something went wrong. Please try again.",
	};
};
