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

	const createFakeJwt = (email) => {
		const header = window.btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
		const payload = window.btoa(
			JSON.stringify({
				email,
				exp: Math.floor(Date.now() / 1000) + 60 * 60,
			})
		);

		return `${header}.${payload}.demo-signature`;
	};

	const setError = (message) => {
		const errorRegion = document.querySelector("[data-login-error]");
		if (!errorRegion) {
			return;
		}

		errorRegion.textContent = message;
		errorRegion.hidden = message.length === 0;
	};

	const renderHomeState = () => {
		if (!homeAction || !greeting) {
			return;
		}

		const { email, token } = getSession();
		const isAuthenticated = Boolean(email && token);

		if (!isAuthenticated) {
			homeAction.innerHTML = '<a class="kainos-header-link" href="/login">Log in</a>';
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

	const handleLoginPage = () => {
		const form = document.querySelector("[data-login-form]");
		if (!(form instanceof HTMLFormElement)) {
			return;
		}

		form.addEventListener("submit", async (event) => {
			event.preventDefault();
			setError("");

			const submitButton = form.querySelector('button[type="submit"]');
			if (submitButton instanceof HTMLButtonElement) {
				submitButton.disabled = true;
			}

			const releaseSubmitButton = () => {
				if (submitButton instanceof HTMLButtonElement) {
					submitButton.disabled = false;
				}
			};

			try {
				const formData = new FormData(form);
				const email = String(formData.get("email") ?? "").trim();
				const password = String(formData.get("password") ?? "");

				if (!email || !password) {
					clearSession();
					setError("Please enter your email and password.");
					return;
				}

				if (
					demoAuthEnabled &&
					email === "test@test.com" &&
					password === "passwordtest"
				) {
					window.sessionStorage.setItem(demoAuthStorageKeys.email, email);
					window.sessionStorage.setItem(
						demoAuthStorageKeys.token,
						createFakeJwt(email),
					);
					window.location.assign("/");
					return;
				}

				const response = await window.fetch("/auth/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ email, password }),
				});

				if (!response.ok) {
					clearSession();

					if (response.status === 400) {
						setError("Invalid login details. Please check and try again.");
						return;
					}

					if (response.status === 401) {
						setError("Invalid email or password. Please try again.");
						return;
					}

					setError("Something went wrong. Please try again in a moment.");
					return;
				}

				const responseBody = await response
					.json()
					.catch(() => ({}));

				const authenticatedEmail =
					typeof responseBody.email === "string" && responseBody.email.length > 0
						? responseBody.email
						: email;
				const authToken =
					typeof responseBody.token === "string" && responseBody.token.length > 0
						? responseBody.token
						: createFakeJwt(authenticatedEmail);

				window.sessionStorage.setItem(
					demoAuthStorageKeys.email,
					authenticatedEmail,
				);
				window.sessionStorage.setItem(demoAuthStorageKeys.token, authToken);
				window.location.assign("/");
			} catch (_error) {
				clearSession();
				setError("Something went wrong. Please try again in a moment.");
			} finally {
				releaseSubmitButton();
			}
		});
	};

	if (page === "home") {
		renderHomeState();
	}

	if (page === "login") {
		handleLoginPage();
	}
})();
