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
		pdf: "application/pdf",
		doc: "application/msword",
		docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	};

	function resolveMimeType(file) {
		if (file.type) return file.type;
		var ext = file.name.split(".").pop().toLowerCase();
		return mimeTypeByExtension[ext] || "application/octet-stream";
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

		// Step 1: get a presigned URL from the backend
		var uploadUrlResponse;
		try {
			uploadUrlResponse = await window.fetch(
				"/job-roles/" + jobRoleId + "/upload-url?fileName=" + encodeURIComponent(file.name),
			);
		} catch {
			setError("Network error. Please check your connection and try again.");
			setLoading(false);
			return;
		}

		if (!uploadUrlResponse.ok) {
			if (uploadUrlResponse.status === 401) {
				window.location.assign("/login?returnTo=" + encodeURIComponent(window.location.pathname));
				return;
			}
			setError("Could not prepare upload. Please try again.");
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
			var mimeType = resolveMimeType(file);
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
					cvFileName: file.name,
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
