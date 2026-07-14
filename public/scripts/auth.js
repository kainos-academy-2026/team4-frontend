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

	const renderAuthState = () => {
		if (!authAction) {
			return;
		}

		const loginPrompts = document.querySelectorAll("[data-login-prompt]");
		const { email, token } = getSession();
		const isAuthenticated = Boolean(email && token);
		const returnTo = encodeURIComponent(window.location.pathname);

		if (!isAuthenticated) {
			authAction.innerHTML = `<a class="kainos-header-link" href="/login?returnTo=${returnTo}">Log in</a>`;
			loginPrompts.forEach(function (el) { el.hidden = false; });

			if (greeting) {
				greeting.hidden = true;
				greeting.textContent = "";
			}
			return;
		}

		authAction.innerHTML =
			'<button class="kainos-header-link kainos-header-button" type="button" data-logout-trigger>Log out</button>';
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

	const handleLoginPage = () => {
		const form = document.querySelector("[data-login-form]");
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
			setError("");

			if (!demoAuthEnabled) {
				clearSession();
				setError("Demo login is currently unavailable.");
				return;
			}

			const formData = new FormData(form);
			const email = String(formData.get("email") ?? "").trim();
			const password = String(formData.get("password") ?? "");

			if (email !== "test@test.com" || password !== "passwordtest") {
				clearSession();
				setError("Invalid email or password. Please try again.");
				return;
			}

			window.sessionStorage.setItem(demoAuthStorageKeys.email, email);
			window.sessionStorage.setItem(demoAuthStorageKeys.token, createFakeJwt(email));
			window.location.assign(returnTo);
		});
	};

	if (page !== "login") {
		renderAuthState();
	}

	if (page === "login") {
		handleLoginPage();
	}
})();
