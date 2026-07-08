(function () {
	const sessionTokenCookieName = "team4_session_token";
	const sessionEmailCookieName = "team4_session_email";
	const mockJwtToken = "mock.jwt.token";

	const readCookie = (cookieName) => {
		const cookieEntry = document.cookie
			.split("; ")
			.find((cookie) => cookie.startsWith(`${cookieName}=`));

		if (!cookieEntry) {
			return null;
		}

		return decodeURIComponent(cookieEntry.slice(cookieName.length + 1));
	};

	const writeSessionCookie = (cookieName, value) => {
		document.cookie = `${cookieName}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
	};

	const clearSessionCookie = (cookieName) => {
		document.cookie = `${cookieName}=; path=/; Max-Age=0; SameSite=Lax`;
	};

	const setHidden = (element, hidden) => {
		if (!element) {
			return;
		}

		element.hidden = hidden;
	};

	const updateAuthState = () => {
		const signedOutLink = document.querySelector("[data-auth-signed-out-link]");
		const signedInHeaderState = document.querySelector("[data-auth-signed-in-state]");
		const logoutAction = document.querySelector("[data-logout-action]");
		const signedInState = document.querySelector('[data-auth-state="signed-in"]');
		const signedOutState = document.querySelector('[data-auth-state="signed-out"]');
		const tokenNote = document.querySelector("[data-session-token-note]");
		const emailNote = document.querySelector("[data-session-email-note]");
		const token = readCookie(sessionTokenCookieName);
		const email = readCookie(sessionEmailCookieName);
		const isAuthenticated = token !== null && token.length > 0;

		setHidden(signedOutLink, isAuthenticated);
		setHidden(signedInHeaderState, !isAuthenticated);
		setHidden(signedInState, !isAuthenticated);
		setHidden(logoutAction, !isAuthenticated);

		setHidden(signedOutState, isAuthenticated);

		if (emailNote) {
			emailNote.textContent = isAuthenticated && email ? email : "";
		}

		if (tokenNote) {
			tokenNote.textContent = isAuthenticated
				? "Session token stored in browser storage."
				: "No session token is stored yet.";
		}
	};

	const handleLoginSubmit = (event) => {
		event.preventDefault();
		const submittedEmail = event.currentTarget.querySelector("#email")?.value?.trim() || "";
		writeSessionCookie(sessionTokenCookieName, mockJwtToken);
		writeSessionCookie(sessionEmailCookieName, submittedEmail);
		updateAuthState();
		window.location.assign("/");
	};

	const handleLogout = (event) => {
		event.preventDefault();
		clearSessionCookie(sessionTokenCookieName);
		clearSessionCookie(sessionEmailCookieName);
		updateAuthState();
		window.location.assign("/login");
	};

	document.addEventListener("DOMContentLoaded", () => {
		const loginForm = document.querySelector("[data-login-form]");
		const logoutActions = document.querySelectorAll("[data-logout-action]");

		if (loginForm) {
			loginForm.addEventListener("submit", handleLoginSubmit);
		}

		logoutActions.forEach((logoutAction) => {
			logoutAction.addEventListener("click", handleLogout);
		});

		updateAuthState();
	});
})();