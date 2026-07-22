import {
	createRegistrationPayload,
	isPasswordValid,
	passwordRequirements,
} from "./registration.shared.js";

const EMAIL_ERROR_MESSAGE = "Please enter a valid email address.";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const setFieldError = (element, message) => {
	if (!element) {
		return;
	}

	if (message) {
		element.textContent = message;
		element.hidden = false;
	} else {
		element.textContent = "";
		element.hidden = true;
	}
};

const setStatus = (element, message) => {
	if (!element) {
		return;
	}

	if (message) {
		element.textContent = message;
		element.hidden = false;
	} else {
		element.textContent = "";
		element.hidden = true;
	}
};

const updatePasswordChecklist = (checklist, password) => {
	if (!checklist) {
		return;
	}

	for (const requirement of passwordRequirements) {
		const item = checklist.querySelector(
			`[data-requirement="${requirement.key}"]`,
		);
		if (item) {
			item.classList.toggle("is-met", requirement.test(password));
		}
	}
};

const initRegisterForm = () => {
	const form = document.querySelector("[data-register-form]");
	if (!form) {
		return;
	}

	const emailInput = form.querySelector("[data-register-email]");
	const passwordInput = form.querySelector("[data-register-password]");
	const emailError = form.querySelector("[data-register-email-error]");
	const passwordChecklist = form.querySelector("[data-password-checklist]");
	const status = form.querySelector("[data-register-status]");
	const submitButton = form.querySelector("[data-register-submit]");

	if (passwordInput) {
		updatePasswordChecklist(passwordChecklist, passwordInput.value);
		passwordInput.addEventListener("input", () => {
			updatePasswordChecklist(passwordChecklist, passwordInput.value);
		});
	}

	form.addEventListener("submit", async (event) => {
		event.preventDefault();

		const email = emailInput ? emailInput.value : "";
		const password = passwordInput ? passwordInput.value : "";

		const isEmailValid = emailPattern.test(email.trim());
		const isPasswordValidResult = isPasswordValid(password);

		setFieldError(emailError, isEmailValid ? null : EMAIL_ERROR_MESSAGE);
		updatePasswordChecklist(passwordChecklist, password);

		if (!isEmailValid || !isPasswordValidResult) {
			setStatus(status, null);
			return;
		}

		if (submitButton) {
			submitButton.disabled = true;
		}
		setStatus(status, "Creating your account...");

		try {
			const response = await fetch("/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(createRegistrationPayload(email, password)),
			});

			const body = await response.json();

			if (response.ok) {
				setStatus(
					status,
					body.message ??
						"Registration Successful, redirecting you to the login page",
				);
				window.setTimeout(() => {
					window.location.href = "/login";
				}, 1500);
				return;
			}

			setStatus(status, body.message ?? "Something went wrong. Please try again.");
		} catch {
			setStatus(status, "Something went wrong. Please try again.");
		} finally {
			if (submitButton) {
				submitButton.disabled = false;
			}
		}
	});
};

initRegisterForm();
