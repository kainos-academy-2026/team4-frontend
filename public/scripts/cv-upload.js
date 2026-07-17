(function () {
	var form = document.querySelector("[data-job-application-form]");
	if (!(form instanceof HTMLFormElement)) {
		return;
	}

	var jobRoleId = form.dataset.jobRoleId;
	if (!jobRoleId) {
		return;
	}

	var errorRegion = document.querySelector("[data-application-error]");
	var submitButton = document.querySelector("[data-submit-application]");

	function setError(message) {
		if (!errorRegion) return;
		errorRegion.textContent = message;
		errorRegion.hidden = message.length === 0;
	}

	function setLoading(loading) {
		if (!submitButton) return;
		submitButton.disabled = loading;
		submitButton.textContent = loading ? "Uploading…" : "Submit application";
	}

	var mimeTypeByExtension = {
		"application/pdf": true,
		"application/msword": true,
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
	};

	function isAllowedMimeType(mimeType) {
		return Boolean(mimeType && mimeTypeByExtension[mimeType]);
	}

	function getAccessTokenFromCookie() {
		if (typeof document.cookie !== "string" || document.cookie.length === 0) {
			return null;
		}

		var cookiePairs = document.cookie.split(";");
		for (var index = 0; index < cookiePairs.length; index += 1) {
			var cookie = cookiePairs[index].trim();
			if (!cookie.startsWith("access_token=")) {
				continue;
			}

			var tokenValue = cookie.substring("access_token=".length);
			return tokenValue.length > 0 ? decodeURIComponent(tokenValue) : null;
		}

		return null;
	}

	function shouldLogDevelopmentErrors() {
		if (!window.location || typeof window.location.hostname !== "string") {
			return false;
		}

		return (
			window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1"
		);
	}

	function logUploadUrlFailure(status, message, requestParams) {
		if (!shouldLogDevelopmentErrors()) {
			return;
		}

		console.error("Upload URL request failed", {
			status: status,
			"response.data.message": message,
			requestParams: requestParams,
		});
	}

	form.addEventListener("submit", async function (event) {
		event.preventDefault();
		setError("");
		setLoading(true);

		var fileInput = form.querySelector("[data-cv-file-input]");
		var file = fileInput instanceof HTMLInputElement ? fileInput.files && fileInput.files[0] : null;

		if (!file) {
			setError("Please select a CV file to upload.");
			setLoading(false);
			return;
		}

		var fileName = file.name;
		var mimeType = file.type;

		if (!isAllowedMimeType(mimeType)) {
			setError("Invalid file type. Allowed types: pdf, doc, docx");
			setLoading(false);
			return;
		}

		var uploadUrlRequestParams = {
			fileName: fileName,
			mimeType: mimeType,
		};
		var uploadUrlQuery = new URLSearchParams(uploadUrlRequestParams);
		var uploadUrlHeaders = {};
		var accessToken = getAccessTokenFromCookie();
		if (accessToken) {
			uploadUrlHeaders.Authorization = "Bearer " + accessToken;
		}

		// Step 1: get a presigned URL from the backend
		var uploadUrlResponse;
		try {
			uploadUrlResponse = await window.fetch(
				"/job-roles/" + jobRoleId + "/applications/upload-url?" + uploadUrlQuery.toString(),
				{ headers: uploadUrlHeaders },
			);
		} catch {
			logUploadUrlFailure(null, "Network error", uploadUrlRequestParams);
			setError("Network error. Please check your connection and try again.");
			setLoading(false);
			return;
		}

		if (!uploadUrlResponse.ok) {
			var uploadUrlErrorData;
			try {
				uploadUrlErrorData = await uploadUrlResponse.json();
			} catch {
				uploadUrlErrorData = null;
			}

			var uploadUrlErrorMessage =
				uploadUrlErrorData && typeof uploadUrlErrorData.message === "string"
					? uploadUrlErrorData.message
					: null;

			logUploadUrlFailure(
				uploadUrlResponse.status,
				uploadUrlErrorMessage,
				uploadUrlRequestParams,
			);

			if (uploadUrlResponse.status === 401) {
				window.location.assign("/login?returnTo=" + encodeURIComponent(window.location.pathname));
				return;
			}

			if (uploadUrlResponse.status === 400) {
				setError(uploadUrlErrorMessage || "Could not prepare upload. Please try again.");
				setLoading(false);
				return;
			}

			if (uploadUrlResponse.status === 404) {
				setError("Job role not found");
				setLoading(false);
				return;
			}

			if (uploadUrlResponse.status === 502) {
				setError("Could not prepare upload. Please try again.");
				setLoading(false);
				return;
			}

			setError(uploadUrlErrorMessage || "Could not prepare upload. Please try again.");
			setLoading(false);
			return;
		}

		var uploadUrlData;
		try {
			uploadUrlData = await uploadUrlResponse.json();
		} catch {
			setError("Could not prepare upload. Please try again.");
			setLoading(false);
			return;
		}

		// Step 2: PUT the file directly to S3 using the presigned URL
		try {
			var s3Response = await window.fetch(uploadUrlData.presignedUrl, {
				method: "PUT",
				headers: { "Content-Type": mimeType },
				body: file,
			});

			if (!s3Response.ok) {
				setError("CV upload failed. Please try again.");
				setLoading(false);
				return;
			}
		} catch {
			setError("CV upload failed. Please check your connection and try again.");
			setLoading(false);
			return;
		}

		// Step 3: notify the backend that the upload is complete
		var confirmResponse;
		try {
			confirmResponse = await window.fetch("/job-roles/" + jobRoleId + "/apply", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					s3Key: uploadUrlData.s3Key,
					cvFileName: fileName,
					cvMimeType: mimeType,
					cvSizeBytes: file.size,
				}),
			});
		} catch {
			setError("Submission failed. Please try again.");
			setLoading(false);
			return;
		}

		if (!confirmResponse.ok) {
			if (confirmResponse.status === 401) {
				window.location.assign("/login?returnTo=" + encodeURIComponent(window.location.pathname));
				return;
			}

			var errorData;
			try {
				errorData = await confirmResponse.json();
			} catch {
				errorData = null;
			}
			setError((errorData && errorData.message) || "Submission failed. Please try again.");
			setLoading(false);
			return;
		}

		var confirmData;
		try {
			confirmData = await confirmResponse.json();
		} catch {
			setError("Submission failed. Please try again.");
			setLoading(false);
			return;
		}

		window.location.assign(confirmData.redirectUrl);
	});
})();
