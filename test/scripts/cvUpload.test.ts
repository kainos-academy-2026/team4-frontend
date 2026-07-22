import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

type ScriptRuntime = {
	submit: () => Promise<void>;
	errorRegion: { textContent: string; hidden: boolean };
	fetchMock: ReturnType<typeof vi.fn>;
	locationAssignMock: ReturnType<typeof vi.fn>;
};

const scriptSource = readFileSync(
	new URL("../../public/scripts/cv-upload.js", import.meta.url),
	"utf8",
);

const setupRuntime = (inputFile: { name: string; type: string; size: number }, fetchMock: ReturnType<typeof vi.fn>): ScriptRuntime => {
	const errorRegion = { textContent: "", hidden: true };
	const submitButton = { disabled: false, textContent: "Submit application" };
	const locationAssignMock = vi.fn();

	class FakeHtmlInputElement {
		files: Array<{ name: string; type: string; size: number }>;

		constructor(file: { name: string; type: string; size: number }) {
			this.files = file ? [file] : [];
		}
	}

	class FakeHtmlFormElement {
		dataset = { jobRoleId: "1" };
		private readonly listeners: Record<string, (event: { preventDefault: () => void }) => Promise<void> | void> = {};
		private readonly fileInput: FakeHtmlInputElement;

		constructor(file: { name: string; type: string; size: number }) {
			this.fileInput = new FakeHtmlInputElement(file);
		}

		querySelector(selector: string) {
			if (selector === "[data-cv-file-input]") {
				return this.fileInput;
			}
			return null;
		}

		addEventListener(type: string, handler: (event: { preventDefault: () => void }) => Promise<void> | void) {
			this.listeners[type] = handler;
		}

		async submit() {
			const submitHandler = this.listeners.submit;
			if (!submitHandler) {
				throw new Error("Submit handler was not registered");
			}

			await submitHandler({ preventDefault: () => undefined });
		}
	}

	const form = new FakeHtmlFormElement(inputFile);

	const context = {
		window: {
			fetch: fetchMock,
			location: {
				pathname: "/job-roles/1/apply",
				hostname: "localhost",
				assign: locationAssignMock,
			},
		},
		document: {
			cookie: "",
			querySelector: (selector: string) => {
				if (selector === "[data-job-application-form]") {
					return form;
				}
				if (selector === "[data-application-error]") {
					return errorRegion;
				}
				if (selector === "[data-submit-application]") {
					return submitButton;
				}
				return null;
			},
		},
		HTMLFormElement: FakeHtmlFormElement,
		HTMLInputElement: FakeHtmlInputElement,
		URLSearchParams,
		console,
		encodeURIComponent,
		decodeURIComponent,
	};

	vm.runInNewContext(scriptSource, context);

	return {
		submit: async () => form.submit(),
		errorRegion,
		fetchMock,
		locationAssignMock,
	};
};

describe("cv-upload frontend script", () => {
	it("includes fileName and mimeType in upload-url request params", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ presignedUrl: "https://s3.example.com/signed", s3Key: "cvs/1/key.pdf" }),
			})
			.mockResolvedValueOnce({ ok: true })
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ redirectUrl: "/job-roles/1/apply?submitted=true" }),
			});

		const runtime = setupRuntime(
			{ name: "cv.pdf", type: "application/pdf", size: 1234 },
			fetchMock,
		);

		await runtime.submit();

		expect(fetchMock).toHaveBeenCalledTimes(3);
		const [uploadUrlRequest] = fetchMock.mock.calls[0] as [string, unknown];
		expect(uploadUrlRequest).toContain("/job-roles/1/applications/upload-url?");
		expect(uploadUrlRequest).toContain("fileName=cv.pdf");
		expect(uploadUrlRequest).toContain("mimeType=application%2Fpdf");
	});

	it("blocks request when mimeType is missing", async () => {
		const fetchMock = vi.fn();
		const runtime = setupRuntime(
			{ name: "cv.pdf", type: "", size: 10 },
			fetchMock,
		);

		await runtime.submit();

		expect(fetchMock).not.toHaveBeenCalled();
		expect(runtime.errorRegion.textContent).toBe(
			"Invalid file type. Allowed types: pdf, doc, docx",
		);
	});

	it("shows validation error for unsupported MIME types", async () => {
		const fetchMock = vi.fn();
		const runtime = setupRuntime(
			{ name: "cv.zip", type: "application/zip", size: 10 },
			fetchMock,
		);

		await runtime.submit();

		expect(fetchMock).not.toHaveBeenCalled();
		expect(runtime.errorRegion.textContent).toBe(
			"Invalid file type. Allowed types: pdf, doc, docx",
		);
	});

	it("surfaces backend 400 upload-url message to the user", async () => {
		const fetchMock = vi.fn().mockResolvedValueOnce({
			ok: false,
			status: 400,
			json: async () => ({ message: "mimeType is required" }),
		});
		const runtime = setupRuntime(
			{ name: "cv.pdf", type: "application/pdf", size: 10 },
			fetchMock,
		);

		await runtime.submit();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(runtime.errorRegion.textContent).toBe("mimeType is required");
		expect(runtime.locationAssignMock).not.toHaveBeenCalled();
	});
});
