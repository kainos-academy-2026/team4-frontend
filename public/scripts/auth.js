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
			'<button class="kainos-header-link kainos-header-button" type="button" data-logout-trigger>Log out</button>';
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

		if (demoAuthEnabled) {
			const emailInput = form.querySelector('input[name="email"]');
			const passwordInput = form.querySelector('input[name="password"]');
			if (emailInput instanceof HTMLInputElement) emailInput.value = "test@test.com";
			if (passwordInput instanceof HTMLInputElement) passwordInput.value = "passwordtest";
		}

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
			window.location.assign("/");
		});
	};

	if (page === "home") {
		renderHomeState();
	}

	if (page === "login") {
		handleLoginPage();
	}
})();
