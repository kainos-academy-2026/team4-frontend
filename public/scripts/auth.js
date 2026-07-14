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
	const authAction = document.querySelector("[data-auth-action]");
	const greeting = document.querySelector("[data-auth-greeting]");

	const getSession = () => ({
		email: window.sessionStorage.getItem(demoAuthStorageKeys.email),
		token: window.sessionStorage.getItem(demoAuthStorageKeys.token),
	});

	const clearSession = () => {
		window.sessionStorage.removeItem(demoAuthStorageKeys.email);
		window.sessionStorage.removeItem(demoAuthStorageKeys.token);
	};

	const renderAuthState = () => {
		if (!authAction) {
			return;
		}

		errorRegion.textContent = message;
		errorRegion.hidden = message.length === 0;
	};

	const renderAuthState = () => {
		if (!authAction) {
			return;
		}

		const loginPrompts = document.querySelectorAll("[data-login-prompt]");
		const { email, token } = getSession();
		const isAuthenticated = Boolean(email && token);
		const returnTo = encodeURIComponent(window.location.pathname);

		if (!isAuthenticated) {
			authAction.innerHTML =
				`<a class="kainos-header-link" href="/register">Register</a><a class="kainos-header-link" href="/login?returnTo=${returnTo}">Log in</a>`;
			loginPrompts.forEach(function (el) { el.hidden = false; });

			if (greeting) {
				greeting.hidden = true;
				greeting.textContent = "";
			}
			return;
		}

		authAction.innerHTML =
			'<a class="kainos-header-link" href="/job-roles">View job roles</a><button class="kainos-header-link kainos-header-button" type="button" data-logout-trigger>Log out</button>';
		loginPrompts.forEach(function (el) { el.hidden = true; });

		if (greeting) {
			greeting.hidden = false;
			greeting.textContent = `Welcome back, ${email}`;
		}

		const logoutTrigger = authAction.querySelector("[data-logout-trigger]");
		if (logoutTrigger) {
			logoutTrigger.addEventListener("click", () => {
				clearSession();
				window.location.reload();
			});
		}
	};

	const handleRegisterPage = () => {
		const form = document.querySelector("[data-register-form]");
		if (!(form instanceof HTMLFormElement)) {
			return;
		}

		if (demoAuthEnabled) {
			const emailInput = form.querySelector('input[name="email"]');
			const passwordInput = form.querySelector('input[name="password"]');
			if (emailInput instanceof HTMLInputElement) emailInput.value = "test@test.com";
			if (passwordInput instanceof HTMLInputElement) passwordInput.value = "passwordtest";
		}

		const params = new URLSearchParams(window.location.search);
		const returnTo = params.get("returnTo") || "/";

		form.addEventListener("submit", (event) => {
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

	if (page !== "login") {
		renderAuthState();
	}

	if (page === "register") {
		handleRegisterPage();
	}
})();
