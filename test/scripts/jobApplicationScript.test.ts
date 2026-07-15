import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";

import { afterEach, describe, expect, it, vi } from "vitest";

const scriptPath = path.join(process.cwd(), "public/scripts/job-application.js");
const script = readFileSync(scriptPath, "utf8");

type FakeFile = { name: string; size: number };
type FakeFileList = { length: number; 0: FakeFile };

// Base class hierarchy mirrors the browser DOM hierarchy used by the script's instanceof checks.
class FakeHtmlElement {
	hidden = false;
	textContent = "";
}
class FakeHtmlButtonElement extends FakeHtmlElement {
	disabled = false;
}
class FakeHtmlAnchorElement extends FakeHtmlElement {
	classList = { add: vi.fn() };
	href: string | null = null;
	removeAttribute = vi.fn();
	setAttribute = vi.fn();
}
class FakeHtmlInputElement extends FakeHtmlElement {
	disabled = false;
	files: FakeFileList | null = null;
	value = "";
}

type RunOptions = {
	page?: string;
	sessionEntries?: Array<[string, string]>;
	jobRoleId?: string;
	withForm?: boolean;
	withFileInput?: boolean;
	fileList?: FakeFileList | null;
	fetchResponse?: {
		ok: boolean;
		status: number;
		json?: () => Promise<unknown>;
	} | null;
	fetchThrows?: boolean;
};

const runScript = async ({
	page = "job-application",
	sessionEntries = [],
	jobRoleId = "42",
	withForm = true,
	withFileInput = true,
	fileList = { length: 1, 0: { name: "my-cv.pdf", size: 1024 } },
	fetchResponse = { ok: true, status: 201, json: async () => ({ id: 1, status: "in_progress" }) },
	fetchThrows = false,
}: RunOptions = {}) => {
	const sessionValues = new Map<string, string>(sessionEntries);
	const assign = vi.fn();

	// Elements are created as instances of the fake classes so instanceof checks in the script pass.
	const fileInputEl = withFileInput
		? Object.assign(new FakeHtmlInputElement(), { files: fileList })
		: null;
	const errorRegionEl = Object.assign(new FakeHtmlElement(), { hidden: true });
	const submitButtonEl = new FakeHtmlButtonElement();
	const confirmationSectionEl = Object.assign(new FakeHtmlElement(), { hidden: true });
	const confirmationTextEl = Object.assign(new FakeHtmlElement(), { hidden: true });
	const applyNowLink = Object.assign(new FakeHtmlAnchorElement(), { href: "/job-roles/42/apply" });

	class FakeHtmlFormElement extends FakeHtmlElement {
		dataset: Record<string, string> = { jobRoleId: jobRoleId ?? "" };
		submitHandler?: (event: { preventDefault: () => void }) => Promise<void> | void;

		addEventListener(
			eventName: string,
			handler: (event: { preventDefault: () => void }) => void,
		) {
			if (eventName === "submit") {
				this.submitHandler = handler;
			}
		}

		reset = vi.fn();
		querySelector = vi.fn((selector: string) => {
			if (selector === "[data-cv-file-input]" && withFileInput) return fileInputEl;
			if (selector === "[data-application-error]") return errorRegionEl;
			if (selector === "[data-submit-application]") return submitButtonEl;
			return null;
		});
	}

	const formEl = withForm ? new FakeHtmlFormElement() : null;

	const fetchMock = fetchThrows
		? vi.fn().mockRejectedValue(new Error("network failure"))
		: vi.fn().mockImplementation((url: string) => {
				if (typeof url === "string" && url.endsWith("/applications/me")) {
					return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
				}
				if (fetchResponse !== null) {
					return Promise.resolve(fetchResponse);
				}
				return new Promise(() => {});
			});

	const sandbox = {
		window: {
			location: { assign },
			sessionStorage: {
				getItem(key: string) { return sessionValues.get(key) ?? null; },
				removeItem(key: string) { sessionValues.delete(key); },
				setItem(key: string, value: string) { sessionValues.set(key, value); },
			},
			fetch: fetchMock,
		},
		document: {
			body: { dataset: { page } },
			querySelector(selector: string) {
				if (selector === "[data-job-application-form]") return withForm ? formEl : null;
				if (selector === "[data-application-confirmation]") return confirmationSectionEl;
				if (selector === "[data-application-confirmation-text]") return confirmationTextEl;
				if (selector === "[data-apply-now]") return applyNowLink;
				return null;
			},
		},
		HTMLElement: FakeHtmlElement,
		HTMLFormElement: FakeHtmlFormElement,
		HTMLAnchorElement: FakeHtmlAnchorElement,
		HTMLInputElement: FakeHtmlInputElement,
		HTMLButtonElement: FakeHtmlButtonElement,
		FormData: class {
			private readonly fields = new Map<string, unknown>();
			append(key: string, value: unknown) { this.fields.set(key, value); }
			get(key: string) { return this.fields.get(key) ?? null; }
		},
		console,
		JSON,
		Math,
		Date,
		Promise,
		setTimeout,
		clearTimeout,
	};

	vm.runInNewContext(script, sandbox, { filename: scriptPath });

	const triggerSubmit = async () => {
		const preventDefault = vi.fn();
		await formEl?.submitHandler?.({ preventDefault });
		return { preventDefault };
	};

	return {
		formEl,
		errorRegionEl,
		submitButtonEl,
		fileInputEl,
		confirmationSectionEl,
		confirmationTextEl,
		applyNowLink,
		fetchMock,
		assign,
		triggerSubmit,
		sessionValues,
	};
};

describe("job-application browser script", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("job-role-detail page", () => {
		it("disables the apply link when user is not authenticated", async () => {
			const result = await runScript({ page: "job-role-detail", sessionEntries: [] });
			expect(result.applyNowLink.classList.add).toHaveBeenCalledWith("kainos-primary-action--disabled");
			expect(result.applyNowLink.removeAttribute).toHaveBeenCalledWith("href");
			expect(result.applyNowLink.setAttribute).toHaveBeenCalledWith("aria-disabled", "true");
		});

		it("leaves the apply link enabled when user is authenticated", async () => {
			const result = await runScript({
				page: "job-role-detail",
				sessionEntries: [
					["demoAuthEmail", "test@test.com"],
					["demoAuthToken", "token.abc"],
				],
			});
			expect(result.applyNowLink.classList.add).not.toHaveBeenCalled();
		});
	});

	describe("job-application page", () => {
		it("returns early when form element is missing", async () => {
			await expect(runScript({ withForm: false })).resolves.not.toThrow();
		});

		it("disables form and shows error when user is not authenticated", async () => {
			const result = await runScript({ sessionEntries: [] });
			expect(result.submitButtonEl.disabled).toBe(true);
			expect(result.errorRegionEl.hidden).toBe(false);
			expect(result.errorRegionEl.textContent).toBe(
				"Log in as an applicant before submitting an application.",
			);
		});

		it("shows error when no file is selected", async () => {
			const result = await runScript({
				sessionEntries: [
					["demoAuthEmail", "test@test.com"],
					["demoAuthToken", "token.abc"],
				],
				fileList: { length: 0, 0: { name: "", size: 0 } },
			});
			await result.triggerSubmit();
			expect(result.errorRegionEl.textContent).toBe("Please upload your CV before submitting.");
			const submitCalls = result.fetchMock.mock.calls.filter(
				([url]: [string]) => !url.endsWith("/applications/me"),
			);
			expect(submitCalls).toHaveLength(0);
		});

		it("shows error when job role id is missing from form dataset", async () => {
			const result = await runScript({
				sessionEntries: [
					["demoAuthEmail", "test@test.com"],
					["demoAuthToken", "token.abc"],
				],
				jobRoleId: "",
			});
			await result.triggerSubmit();
			expect(result.errorRegionEl.textContent).toBe("Unable to submit application for this role.");
			expect(result.fetchMock).not.toHaveBeenCalled();
		});

		it("sends POST request with Authorization header and CV file on submit", async () => {
			const result = await runScript({
				sessionEntries: [
					["demoAuthEmail", "test@test.com"],
					["demoAuthToken", "token.abc"],
				],
			});
			await result.triggerSubmit();
			const submitCalls = result.fetchMock.mock.calls.filter(
				([url]: [string]) => !url.endsWith("/applications/me"),
			);
			expect(submitCalls).toHaveLength(1);
			const [url, options] = submitCalls[0] as [string, RequestInit & { headers: Record<string, string> }];
			expect(url).toBe("/job-roles/42/applications");
			expect(options.method).toBe("POST");
			expect(options.headers.Authorization).toBe("Bearer token.abc");
		});

		it("shows confirmation on 201 success", async () => {
			const result = await runScript({
				sessionEntries: [
					["demoAuthEmail", "test@test.com"],
					["demoAuthToken", "token.abc"],
				],
				fetchResponse: { ok: true, status: 201, json: async () => ({ id: 1, status: "in_progress" }) },
			});
			await result.triggerSubmit();
			expect(result.confirmationSectionEl.hidden).toBe(false);
			expect(result.confirmationTextEl.textContent).toContain("in progress");
			expect(result.confirmationTextEl.textContent).toContain("my-cv.pdf");
			expect(result.formEl?.hidden).toBe(true);
		});

		it("redirects to login on 401 response", async () => {
			const result = await runScript({
				sessionEntries: [
					["demoAuthEmail", "test@test.com"],
					["demoAuthToken", "token.abc"],
				],
				fetchResponse: { ok: false, status: 401, json: async () => ({}) },
			});
			await result.triggerSubmit();
			expect(result.assign).toHaveBeenCalledWith("/login?returnTo=/job-roles/42/apply");
			expect(result.confirmationSectionEl.hidden).toBe(true);
		});

		it("shows message from response body on 400", async () => {
			const result = await runScript({
				sessionEntries: [
					["demoAuthEmail", "test@test.com"],
					["demoAuthToken", "token.abc"],
				],
				fetchResponse: {
					ok: false,
					status: 400,
					json: async () => ({ message: "Unsupported file type." }),
				},
			});
			await result.triggerSubmit();
			expect(result.errorRegionEl.textContent).toBe("Unsupported file type.");
		});

		it("shows default message on 400 when response body has no message", async () => {
			const result = await runScript({
				sessionEntries: [
					["demoAuthEmail", "test@test.com"],
					["demoAuthToken", "token.abc"],
				],
				fetchResponse: {
					ok: false,
					status: 400,
					json: async () => ({}),
				},
			});
			await result.triggerSubmit();
			expect(result.errorRegionEl.textContent).toBe(
				"Invalid request. Please check your CV file and try again.",
			);
		});

		it("shows not-found error on 404", async () => {
			const result = await runScript({
				sessionEntries: [
					["demoAuthEmail", "test@test.com"],
					["demoAuthToken", "token.abc"],
				],
				fetchResponse: { ok: false, status: 404, json: async () => ({}) },
			});
			await result.triggerSubmit();
			expect(result.errorRegionEl.textContent).toBe("This job role no longer exists.");
		});

		it("shows retry message on 502", async () => {
			const result = await runScript({
				sessionEntries: [
					["demoAuthEmail", "test@test.com"],
					["demoAuthToken", "token.abc"],
				],
				fetchResponse: { ok: false, status: 502, json: async () => ({}) },
			});
			await result.triggerSubmit();
			expect(result.errorRegionEl.textContent).toBe("CV upload failed. Please try again later.");
		});

		it("shows generic error on unexpected non-ok response", async () => {
			const result = await runScript({
				sessionEntries: [
					["demoAuthEmail", "test@test.com"],
					["demoAuthToken", "token.abc"],
				],
				fetchResponse: { ok: false, status: 500, json: async () => ({}) },
			});
			await result.triggerSubmit();
			expect(result.errorRegionEl.textContent).toBe(
				"Something went wrong. Please try again later.",
			);
		});

		it("shows network error when fetch throws", async () => {
			const result = await runScript({
				sessionEntries: [
					["demoAuthEmail", "test@test.com"],
					["demoAuthToken", "token.abc"],
				],
				fetchThrows: true,
			});
			await result.triggerSubmit();
			expect(result.errorRegionEl.textContent).toBe(
				"Unable to reach the server. Please check your connection and try again.",
			);
		});
	});
});
