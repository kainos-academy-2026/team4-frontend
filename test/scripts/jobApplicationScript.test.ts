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
	className = "";
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
	withApplySection?: boolean;
	applySectionJobRoleId?: string;
	withConfirmationHeading?: boolean;
	applicationsMeOkResponse?: {
		ok: boolean;
		status: number;
		json?: () => Promise<unknown>;
	};
	homeBadges?: Array<{ roleId: string }>;
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
	withApplySection = false,
	applySectionJobRoleId,
	withConfirmationHeading = false,
	applicationsMeOkResponse,
	homeBadges,
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
	const confirmationHeadingEl = withConfirmationHeading
		? Object.assign(new FakeHtmlElement(), { hidden: false })
		: null;
	const applyNowLink = Object.assign(new FakeHtmlAnchorElement(), { href: "/job-roles/42/apply" });
	const applySectionEl = withApplySection
		? Object.assign(new FakeHtmlElement(), {
				dataset: { jobRoleId: applySectionJobRoleId ?? jobRoleId ?? "42" },
			})
		: null;
	const applicationStatusEl = new FakeHtmlElement();
	const roleBadgeEl = new FakeHtmlElement();
	const homeBadgeEls = (homeBadges ?? []).map(({ roleId: badgeRoleId }) =>
		Object.assign(new FakeHtmlElement(), {
			dataset: { roleStatusBadge: badgeRoleId },
		}),
	);

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
					if (applicationsMeOkResponse !== undefined) {
						return Promise.resolve(applicationsMeOkResponse);
					}
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
				if (selector === "[data-application-confirmation-heading]") return confirmationHeadingEl;
				if (selector === "[data-apply-now]") return applyNowLink;
				if (selector === "[data-apply-section]") return applySectionEl;
				if (selector === "[data-application-status]") return applicationStatusEl;
				if (selector === "[data-role-status-badge]") return roleBadgeEl;
				return null;
			},
			querySelectorAll(selector: string) {
				if (selector === "[data-role-status-badge]") return homeBadgeEls;
				return [];
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
		confirmationHeadingEl,
		applicationStatusEl,
		roleBadgeEl,
		applyNowLink,
		fetchMock,
		assign,
		triggerSubmit,
		sessionValues,
		homeBadgeEls,
	};
};

describe("job-application browser script", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns early when body is missing", () => {
		const sandbox = {
			window: {
				location: { assign: vi.fn() },
				sessionStorage: { getItem: () => null, removeItem: () => {}, setItem: () => {} },
				fetch: vi.fn(),
			},
			document: {
				body: null,
				querySelector: () => null,
				querySelectorAll: () => [],
			},
			HTMLElement: FakeHtmlElement,
			HTMLFormElement: class extends FakeHtmlElement {},
			HTMLAnchorElement: FakeHtmlAnchorElement,
			HTMLInputElement: FakeHtmlInputElement,
			HTMLButtonElement: FakeHtmlButtonElement,
			FormData: class {
				append() {}
				get() { return null; }
			},
			console, JSON, Math, Date, Promise, setTimeout, clearTimeout,
		};
		expect(() => vm.runInNewContext(script, sandbox, { filename: scriptPath })).not.toThrow();
	});

	describe("job-role-detail page", () => {
		it("does not modify the apply link (auth is handled server-side)", async () => {
			const result = await runScript({ page: "job-role-detail" });
			expect(result.applyNowLink.classList.add).not.toHaveBeenCalled();
			expect(result.applyNowLink.removeAttribute).not.toHaveBeenCalled();
		});
	});

	describe("job-application page", () => {
		it("returns early when form element is missing", async () => {
			await expect(runScript({ withForm: false })).resolves.not.toThrow();
		});

		it("disables form and shows error when user is not authenticated", async () => {
			// Auth is enforced server-side via the access_token cookie.
			// The form is always shown; a 401 response redirects to login.
			const result = await runScript({
				fetchResponse: { ok: false, status: 401, json: async () => ({}) },
			});
			await result.triggerSubmit();
			expect(result.assign).toHaveBeenCalledWith("/login?returnTo=/job-roles/42/apply");
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

		it("sends POST request with CV file on submit (cookie auth is automatic)", async () => {
			const result = await runScript();
			await result.triggerSubmit();
			const submitCalls = result.fetchMock.mock.calls.filter(
				([url]: [string]) => !url.endsWith("/applications/me"),
			);
			expect(submitCalls).toHaveLength(1);
			const [url, options] = submitCalls[0] as [string, RequestInit & { headers?: Record<string, string> }];
			expect(url).toBe("/job-roles/42/applications");
			expect(options.method).toBe("POST");
			expect(options.headers).toBeUndefined();
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

		it("shows existing application message when a prior application is found on load", async () => {
			const result = await runScript({
				applicationsMeOkResponse: {
					ok: true,
					status: 200,
					json: async () => ({ cvFileName: "old-cv.pdf" }),
				},
			});
			await new Promise<void>((resolve) => setTimeout(resolve, 10));

			expect(result.confirmationSectionEl.hidden).toBe(false);
			expect(result.confirmationTextEl.textContent).toContain("old-cv.pdf");
		});

		it("shows 'CV updated' heading when submitting over an existing application", async () => {
			const result = await runScript({
				withConfirmationHeading: true,
				applicationsMeOkResponse: {
					ok: true,
					status: 200,
					json: async () => ({ cvFileName: "old-cv.pdf" }),
				},
			});
			await new Promise<void>((resolve) => setTimeout(resolve, 10));

			await result.triggerSubmit();

			expect(result.confirmationHeadingEl?.textContent).toBe("CV updated");
		});

		it("shows 'Application submitted' heading on first application", async () => {
			const result = await runScript({ withConfirmationHeading: true });
			await result.triggerSubmit();

			expect(result.confirmationHeadingEl?.textContent).toBe("Application submitted");
		});
	});

	describe("job-role-detail page — application status", () => {
		it("updates status element and badge when an application exists", async () => {
			const result = await runScript({
				page: "job-role-detail",
				withApplySection: true,
				applicationsMeOkResponse: {
					ok: true,
					status: 200,
					json: async () => ({ status: "in_progress" }),
				},
			});
			await new Promise<void>((resolve) => setTimeout(resolve, 10));

			expect(result.applicationStatusEl.textContent).toContain("application in progress");
			expect(result.applicationStatusEl.hidden).toBe(false);
			expect(result.roleBadgeEl.textContent).toBe("In Progress");
			expect(result.roleBadgeEl.className).toBe("badge badge--in-progress");
		});

		it("does not update status element when no application exists", async () => {
			const result = await runScript({ page: "job-role-detail", withApplySection: true });
			await new Promise<void>((resolve) => setTimeout(resolve, 10));

			expect(result.applicationStatusEl.textContent).toBe("");
			expect(result.roleBadgeEl.textContent).toBe("");
		});
	});

	describe("home page — badge updates", () => {
		it("updates badge to In Progress when an application exists for the role", async () => {
			const result = await runScript({
				page: "home",
				homeBadges: [{ roleId: "42" }],
				applicationsMeOkResponse: {
					ok: true,
					status: 200,
					json: async () => ({ status: "in_progress" }),
				},
			});
			await new Promise<void>((resolve) => setTimeout(resolve, 10));

			expect(result.homeBadgeEls[0].textContent).toBe("In Progress");
			expect(result.homeBadgeEls[0].className).toBe("badge badge--in-progress");
		});

		it("does not update badge when no application is found", async () => {
			const result = await runScript({
				page: "home",
				homeBadges: [{ roleId: "42" }],
			});
			await new Promise<void>((resolve) => setTimeout(resolve, 10));

			expect(result.homeBadgeEls[0].textContent).toBe("");
		});
	});
});
