(function () {
	const body = document.body;
	if (!body) {
		return;
	}

	const page = body.dataset.page;

	const isApplicantAuthenticated = () => {
		const email = window.sessionStorage.getItem("demoAuthEmail");
		const token = window.sessionStorage.getItem("demoAuthToken");
		return Boolean(email && token);
	};

	const parseStoredApplications = () => {
		const raw = window.sessionStorage.getItem("demoJobApplications");
		if (!raw) {
			return {};
		}

		try {
			return JSON.parse(raw);
		} catch {
			return {};
		}
	};

	if (page === "job-role-detail") {
		const applyCta = document.querySelector("[data-role-apply-cta]");
		const loginMessage = document.querySelector("[data-role-apply-login-message]");

		if (applyCta instanceof HTMLElement) {
			const applicantAuthenticated = isApplicantAuthenticated();

			applyCta.hidden = !applicantAuthenticated;

			if (loginMessage instanceof HTMLElement) {
				loginMessage.hidden = applicantAuthenticated;
			}
		}
	}

	if (page === "job-application") {
		const form = document.querySelector("[data-job-application-form]");
		if (!(form instanceof HTMLFormElement)) {
			return;
		}

		const fileInput = form.querySelector("[data-cv-file-input]");
		const errorRegion = form.querySelector("[data-application-error]");
		const submitButton = form.querySelector("[data-submit-application]");
		const confirmationSection = document.querySelector(
			"[data-application-confirmation]",
		);
		const confirmationText = document.querySelector(
			"[data-application-confirmation-text]",
		);

		const setError = (message) => {
			if (!(errorRegion instanceof HTMLElement)) {
				return;
			}

			errorRegion.textContent = message;
			errorRegion.hidden = message.length === 0;
		};

		if (!isApplicantAuthenticated()) {
			if (submitButton instanceof HTMLButtonElement) {
				submitButton.disabled = true;
			}

			if (fileInput instanceof HTMLInputElement) {
				fileInput.disabled = true;
			}

			setError("Log in as an applicant before submitting an application.");
			return;
		}

		form.addEventListener("submit", (event) => {
			event.preventDefault();
			setError("");

			if (!(fileInput instanceof HTMLInputElement) || !fileInput.files?.length) {
				setError("Please upload your CV before submitting.");
				return;
			}

			const cvFile = fileInput.files[0];
			const roleId = form.dataset.jobRoleId;
			if (!roleId) {
				setError("Unable to submit application for this role.");
				return;
			}

			const applications = parseStoredApplications();
			applications[roleId] = {
				cvFileName: cvFile.name,
				status: "in progress",
				updatedAt: new Date().toISOString(),
			};

			window.sessionStorage.setItem(
				"demoJobApplications",
				JSON.stringify(applications),
			);

			if (confirmationSection instanceof HTMLElement) {
				confirmationSection.hidden = false;
			}

			if (confirmationText instanceof HTMLElement) {
				confirmationText.textContent = `Status: in progress. CV uploaded: ${cvFile.name}`;
			}

			form.reset();
		});
	}
})();