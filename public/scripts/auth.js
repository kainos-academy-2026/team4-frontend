(function () {
	const demoAuthStorageKeys = {
		email: "demoAuthEmail",
		role: "demoAuthRole",
		token: "demoAuthToken",
	};

	const body = document.body;
	if (!body) {
		return;
	}

	const page = body.dataset.page;
	const authEmail = body.dataset.authEmail ?? "";
	const isAuthenticated = body.dataset.authenticated === "true";
	const demoAuthEnabled = body.dataset.demoAuthEnabled === "true";
	const homeAction = document.querySelector("[data-home-auth-action]");
	const greeting = document.querySelector("[data-auth-greeting]");

	const getSession = () => ({
		email: window.sessionStorage.getItem(demoAuthStorageKeys.email),
		token: window.sessionStorage.getItem(demoAuthStorageKeys.token),
	});

	const clearSession = () => {
		window.sessionStorage.removeItem(demoAuthStorageKeys.email);
		window.sessionStorage.removeItem(demoAuthStorageKeys.role);
		window.sessionStorage.removeItem(demoAuthStorageKeys.token);
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

		const session = getSession();
		const activeEmail = session.email || authEmail;
		const activeToken = session.token;
		const hasSession = Boolean((activeEmail && activeToken) || isAuthenticated);

		if (!hasSession) {
			homeAction.innerHTML = '<a class="kainos-header-link" href="/login">Log in</a>';
			greeting.hidden = true;
			greeting.textContent = "";
			return;
		}

		homeAction.innerHTML =
			'<button class="kainos-header-link kainos-header-button" type="button" data-logout-trigger>Log out</button>';
		greeting.hidden = false;
		greeting.textContent = `Welcome back, ${activeEmail}`;

		const logoutTrigger = document.querySelector("[data-logout-trigger]");
		if (logoutTrigger instanceof HTMLButtonElement) {
			logoutTrigger.addEventListener("click", async () => {
				try {
					const response = await window.fetch("/logout", { method: "POST" });
					if (response.status !== 204) {
						console.error("Failed to log out", response.status);
						window.alert("Unable to log out right now. Please try again.");
						return;
					}

					clearSession();
					window.location.assign("/login");
				} catch (error) {
					console.error("Failed to log out", error);
					window.alert("Unable to log out right now. Please try again.");
				}
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

			if (!demoAuthEnabled) {
				clearSession();
				setError("Demo login is currently unavailable.");
				return;
			}

			const formData = new FormData(form);
			const email = String(formData.get("email") ?? "").trim();
			const password = String(formData.get("password") ?? "");
			let response;

			try {
				response = await window.fetch("/login", {
					body: JSON.stringify({ email, password }),
					headers: {
						"Content-Type": "application/json",
					},
					method: "POST",
				});
			} catch (error) {
				console.error("Failed to submit login request", error);
				clearSession();
				setError("Unable to log in right now. Please check your connection and try again.");
				return;
			}

			if (!response.ok) {
				clearSession();
				const payload = await response
					.json()
					.catch(() => ({ message: "Unable to log in." }));
				setError(payload.message ?? "Unable to log in.");
				return;
			}

			const payload = await response.json();
			window.sessionStorage.setItem(demoAuthStorageKeys.email, payload.email);
			window.sessionStorage.setItem(demoAuthStorageKeys.role, payload.role);
			window.sessionStorage.setItem(demoAuthStorageKeys.token, payload.token);
			window.location.assign(payload.redirectTo ?? "/");
		});
	};

	if (page === "home") {
		renderHomeState();
	}

	if (page === "login") {
		handleLoginPage();
	}
})();
