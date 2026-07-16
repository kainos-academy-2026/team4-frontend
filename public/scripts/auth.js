import {
	createRegistrationPayload,
} from "./registration.shared.js";

(function () {
	const demoAuthStorageKeys = {
		email: "demoAuthEmail",
		token: "demoAuthToken",
	};

	const body = document.body;
	if (!body) {
		return;
	}

	const page = body.dataset.page;
	const demoAuthEnabled = body.dataset.demoAuthEnabled === "true";
	const homeAction = document.querySelector("[data-home-auth-action]");
	const greeting = document.querySelector("[data-auth-greeting]");

	const getSession = () => ({
		email: window.sessionStorage.getItem(demoAuthStorageKeys.email),
		token: window.sessionStorage.getItem(demoAuthStorageKeys.token),
	});

	const clearSession = () => {
		window.sessionStorage.removeItem(demoAuthStorageKeys.email);
		window.sessionStorage.removeItem(demoAuthStorageKeys.token);
	};

	const renderHomeState = () => {
		if (!homeAction || !greeting) {
			return;
		}

		const { email, token } = getSession();
		const isAuthenticated = Boolean(email && token);

		if (!isAuthenticated) {
			homeAction.innerHTML =
				'<a class="kainos-header-link" href="/register">Register</a><a class="kainos-header-link" href="/login">Log in</a>';
			greeting.hidden = true;
			greeting.textContent = "";
			return;
		}

		homeAction.innerHTML =
			'<a class="kainos-header-link" href="/job-roles">View job roles</a><button class="kainos-header-link kainos-header-button" type="button" data-logout-trigger>Log out</button>';
		greeting.hidden = false;
		greeting.textContent = `Welcome back, ${email}`;

		const logoutTrigger = document.querySelector("[data-logout-trigger]");
		if (logoutTrigger) {
			logoutTrigger.addEventListener("click", () => {
				clearSession();
				renderHomeState();
			});
		}
	};

	const handleRegisterPage = () => {
		const form = document.querySelector("[data-register-form]");
		if (!(form instanceof HTMLFormElement)) {
			return;
		}

		const emailInput = form.querySelector("[data-register-email]");
		const passwordInput = form.querySelector("[data-register-password]");
		const emailError = form.querySelector("[data-register-email-error]");
		const passwordError = form.querySelector("[data-register-password-error]");
		const statusRegion = form.querySelector("[data-register-status]");
		const submitButton = form.querySelector("[data-register-submit]");

		if (
			!(emailInput instanceof HTMLInputElement) ||
			!(passwordInput instanceof HTMLInputElement) ||
			!(emailError instanceof HTMLElement) ||
			!(passwordError instanceof HTMLElement) ||
			!(statusRegion instanceof HTMLElement) ||
			!(submitButton instanceof HTMLButtonElement)
		) {
			return;
		}

		let isSubmitting = false;

		const renderFieldError = (target, message) => {
			target.textContent = message;
			target.hidden = message.length === 0;
		};

		const renderStatus = ({ variant, message, cta }) => {
			statusRegion.textContent = message;
			statusRegion.dataset.status = variant;
			statusRegion.hidden = message.length === 0;

			if (cta) {
				statusRegion.textContent = "";
				const messageSpan = document.createElement("span");
				messageSpan.textContent = `${message} `;
				const ctaLink = document.createElement("a");
				ctaLink.href = cta.href;
				ctaLink.textContent = cta.label;
				statusRegion.append(messageSpan, ctaLink);
			}
		};

		const registerUser = async (payload) => {
			const response = await fetch("/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			let data = null;

			try {
				data = await response.json();
			} catch (_error) {
				data = null;
			}

			return {
				status: response.status,
				data,
			};
		};

		form.addEventListener("submit", async (event) => {
			event.preventDefault();

			if (isSubmitting) {
				return;
			}

			const email = emailInput.value;
			const password = passwordInput.value;

			renderFieldError(emailError, "");
			renderFieldError(passwordError, "");
			renderStatus({ variant: "idle", message: "", cta: null });

			isSubmitting = true;
			submitButton.disabled = true;
			renderStatus({ variant: "info", message: "Creating account...", cta: null });

			try {
				const payload = createRegistrationPayload(email, password);
				const registrationResult = await registerUser(payload);
				const fieldErrors = registrationResult.data?.fieldErrors;

				renderFieldError(emailError, fieldErrors?.email ?? "");
				renderFieldError(passwordError, fieldErrors?.password ?? "");

				renderStatus({
					variant: registrationResult.data?.variant ?? "error",
					message:
						registrationResult.data?.message ??
						"Something went wrong. Please try again.",
					cta: null,
				});

				if (registrationResult.status === 201) {
					form.reset();
					renderFieldError(emailError, "");
					renderFieldError(passwordError, "");
					window.setTimeout(() => {
						window.location.assign("/login");
					}, 1500);
				}
			} catch (_error) {
				renderStatus({
					variant: "error",
					message: "Something went wrong. Please try again.",
					cta: null,
				});
			} finally {
				isSubmitting = false;
				submitButton.disabled = false;
			}
		});
	};

	if (page === "home") {
		renderHomeState();
	}

	if (page === "register") {
		handleRegisterPage();
	}
})();
