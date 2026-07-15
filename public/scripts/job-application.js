(function () {
	const body = document.body;
	if (!body) {
		return;
	}

	const page = body.dataset.page;

	const getAuthToken = () => window.sessionStorage.getItem("demoAuthToken");

	const isApplicantAuthenticated = () => {
		const email = window.sessionStorage.getItem("demoAuthEmail");
		const token = getAuthToken();
		return Boolean(email && token);
	};

	const getBearerHeader = () => {
		const token = getAuthToken();
		return token ? `Bearer ${token}` : null;
	};

	if (page === "home") {
		if (isApplicantAuthenticated()) {
			const bearerHeader = getBearerHeader();
			const badges = document.querySelectorAll("[data-role-status-badge]");
			badges.forEach(function (badge) {
				if (!(badge instanceof HTMLElement)) return;
				const roleId = badge.dataset.roleStatusBadge;
				if (!roleId || !bearerHeader) return;
				window.fetch(`/job-roles/${roleId}/applications/me`, {
					headers: { Authorization: bearerHeader },
				}).then(function (res) {
					if (!res.ok) return null;
					return res.json();
				}).then(function (data) {
					if (!data) return;
					badge.textContent = "In Progress";
					badge.className = "badge badge--in-progress";
				}).catch(function () {
					// best-effort
				});
			});
		}
	}

	if (page === "job-role-detail") {
		const applyNowLink = document.querySelector("[data-apply-now]");
		if (applyNowLink instanceof HTMLAnchorElement && !isApplicantAuthenticated()) {
			applyNowLink.classList.add("kainos-primary-action--disabled");
			applyNowLink.removeAttribute("href");
			applyNowLink.setAttribute("aria-disabled", "true");
		}

		if (isApplicantAuthenticated()) {
			const applySection = document.querySelector("[data-apply-section]");
			if (applySection instanceof HTMLElement) {
				const roleId = applySection.dataset.jobRoleId;
				const bearerHeader = getBearerHeader();
				if (roleId && bearerHeader) {
					window.fetch(`/job-roles/${roleId}/applications/me`, {
						headers: { Authorization: bearerHeader },
					}).then(function (res) {
						if (!res.ok) return null;
						return res.json();
					}).then(function (data) {
						if (!data) return;
						const statusEl = document.querySelector("[data-application-status]");
						if (statusEl instanceof HTMLElement) {
							statusEl.textContent = `You have an application in progress for this role. You can re-upload your CV using the Apply now button.`;
							statusEl.hidden = false;
						}
						const statusBadge = document.querySelector("[data-role-status-badge]");
						if (statusBadge instanceof HTMLElement) {
							statusBadge.textContent = "In Progress";
							statusBadge.className = "badge badge--in-progress";
						}
					}).catch(function () {
						// status fetch is best-effort; silent failure is acceptable
					});
				}
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

		const showConfirmation = (status, cvFileName) => {
			if (confirmationSection instanceof HTMLElement) {
				confirmationSection.hidden = false;
			}
			const heading = document.querySelector("[data-application-confirmation-heading]");
			if (heading instanceof HTMLElement) {
				heading.textContent = status === "updated" ? "CV updated" : "Application submitted";
			}
			if (confirmationText instanceof HTMLElement) {
				const label = status === "updated" ? "Your CV has been updated" : `Status: ${status.replace("_", " ")}`;
				confirmationText.textContent = `${label}. CV uploaded: ${cvFileName}`;
			}
			form.hidden = true;
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

		const roleId = form.dataset.jobRoleId;
		const bearerHeader = getBearerHeader();
		let hasExistingApplication = false;

		if (roleId && bearerHeader) {
			window.fetch(`/job-roles/${roleId}/applications/me`, {
				headers: { Authorization: bearerHeader },
			}).then(function (res) {
				if (!res.ok) return null;
				return res.json();
			}).then(function (data) {
				if (!data) return;
				hasExistingApplication = true;
				if (confirmationSection instanceof HTMLElement) {
					confirmationSection.hidden = false;
				}
				if (confirmationText instanceof HTMLElement) {
					confirmationText.textContent = `You have an active application for this role (CV: ${data.cvFileName ?? "on file"}). You can upload a new CV below to update it.`;
				}
			}).catch(function () {
				// status fetch is best-effort; continue to show form
			});
		}

		form.addEventListener("submit", async (event) => {
			event.preventDefault();
			setError("");

			if (!(fileInput instanceof HTMLInputElement) || !fileInput.files?.length) {
				setError("Please upload your CV before submitting.");
				return;
			}

			const cvFile = fileInput.files[0];
			if (!roleId) {
				setError("Unable to submit application for this role.");
				return;
			}

			const token = getAuthToken();
			if (!token) {
				window.location.assign(`/login?returnTo=/job-roles/${roleId}/apply`);
				return;
			}

			const formData = new FormData();
			formData.append("cvFile", cvFile);

			let response;
			try {
				response = await window.fetch(`/job-roles/${roleId}/applications`, {
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
					body: formData,
				});
			} catch {
				setError("Unable to reach the server. Please check your connection and try again.");
				return;
			}

			if (response.status === 401) {
				window.location.assign(`/login?returnTo=/job-roles/${roleId}/apply`);
				return;
			}

			if (response.status === 400) {
				let message = "Invalid request. Please check your CV file and try again.";
				try {
					const body = await response.json();
					if (typeof body.message === "string" && body.message.length > 0) {
						message = body.message;
					}
				} catch {
					// use default message
				}
				setError(message);
				return;
			}

			if (response.status === 404) {
				setError("This job role no longer exists.");
				return;
			}

			if (response.status === 502) {
				setError("CV upload failed. Please try again later.");
				return;
			}

			if (!response.ok) {
				setError("Something went wrong. Please try again later.");
				return;
			}

			showConfirmation(hasExistingApplication ? "updated" : "in_progress", cvFile.name);
		});
	}
})();(function () {
	const body = document.body;
	if (!body) {
		return;
	}

	const page = body.dataset.page;

	const getAuthToken = () => window.sessionStorage.getItem("demoAuthToken");

	const isApplicantAuthenticated = () => {
		const email = window.sessionStorage.getItem("demoAuthEmail");
		const token = getAuthToken();
		return Boolean(email && token);
	};

	const getBearerHeader = () => {
		const token = getAuthToken();
		return token ? `Bearer ${token}` : null;
	};

	if (page === "home") {
		if (isApplicantAuthenticated()) {
			const bearerHeader = getBearerHeader();
			const badges = document.querySelectorAll("[data-role-status-badge]");
			badges.forEach(function (badge) {
				if (!(badge instanceof HTMLElement)) return;
				const roleId = badge.dataset.roleStatusBadge;
				if (!roleId || !bearerHeader) return;
				window.fetch(`/job-roles/${roleId}/applications/me`, {
					headers: { Authorization: bearerHeader },
				}).then(function (res) {
					if (!res.ok) return null;
					return res.json();
				}).then(function (data) {
					if (!data) return;
					badge.textContent = "In Progress";
					badge.className = "badge badge--in-progress";
				}).catch(function () {
					// best-effort
				});
			});
		}
	}

	if (page === "job-role-detail") {
		const applyNowLink = document.querySelector("[data-apply-now]");
		if (applyNowLink instanceof HTMLAnchorElement && !isApplicantAuthenticated()) {
			applyNowLink.classList.add("kainos-primary-action--disabled");
			applyNowLink.removeAttribute("href");
			applyNowLink.setAttribute("aria-disabled", "true");
		}

		if (isApplicantAuthenticated()) {
			const applySection = document.querySelector("[data-apply-section]");
			if (applySection instanceof HTMLElement) {
				const roleId = applySection.dataset.jobRoleId;
				const bearerHeader = getBearerHeader();
				if (roleId && bearerHeader) {
					window.fetch(`/job-roles/${roleId}/applications/me`, {
						headers: { Authorization: bearerHeader },
					}).then(function (res) {
						if (!res.ok) return null;
						return res.json();
					}).then(function (data) {
						if (!data) return;
						const statusEl = document.querySelector("[data-application-status]");
						if (statusEl instanceof HTMLElement) {
							statusEl.textContent = `You have an application in progress for this role. You can re-upload your CV using the Apply now button.`;
							statusEl.hidden = false;
						}
						const statusBadge = document.querySelector("[data-role-status-badge]");
						if (statusBadge instanceof HTMLElement) {
							statusBadge.textContent = "In Progress";
							statusBadge.className = "badge badge--in-progress";
						}
					}).catch(function () {
						// status fetch is best-effort; silent failure is acceptable
					});
				}
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

		const showConfirmation = (status, cvFileName) => {
			if (confirmationSection instanceof HTMLElement) {
				confirmationSection.hidden = false;
			}
			const heading = document.querySelector("[data-application-confirmation-heading]");
			if (heading instanceof HTMLElement) {
				heading.textContent = status === "updated" ? "CV updated" : "Application submitted";
			}
			if (confirmationText instanceof HTMLElement) {
				const label = status === "updated" ? "Your CV has been updated" : `Status: ${status.replace("_", " ")}`;
				confirmationText.textContent = `${label}. CV uploaded: ${cvFileName}`;
			}
			form.hidden = true;
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

		const roleId = form.dataset.jobRoleId;
		const bearerHeader = getBearerHeader();
		let hasExistingApplication = false;

		if (roleId && bearerHeader) {
			window.fetch(`/job-roles/${roleId}/applications/me`, {
				headers: { Authorization: bearerHeader },
			}).then(function (res) {
				if (!res.ok) return null;
				return res.json();
			}).then(function (data) {
				if (!data) return;
				hasExistingApplication = true;
				if (confirmationSection instanceof HTMLElement) {
					confirmationSection.hidden = false;
				}
				if (confirmationText instanceof HTMLElement) {
					confirmationText.textContent = `You have an active application for this role (CV: ${data.cvFileName ?? "on file"}). You can upload a new CV below to update it.`;
				}
			}).catch(function () {
				// status fetch is best-effort; continue to show form
			});
		}

		form.addEventListener("submit", async (event) => {
			event.preventDefault();
			setError("");

			if (!(fileInput instanceof HTMLInputElement) || !fileInput.files?.length) {
				setError("Please upload your CV before submitting.");
				return;
			}

			const cvFile = fileInput.files[0];
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