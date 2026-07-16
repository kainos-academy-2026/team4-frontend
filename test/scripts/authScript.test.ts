import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";

import { describe, expect, it, vi } from "vitest";

type FakeInput = {
	value: string;
};

type SubmitButton = {
	clickHandler?: (event: { preventDefault: () => void }) => void;
	addEventListener: (
		eventName: string,
		handler: (event: { preventDefault: () => void }) => void,
	) => void;
};

type FakeForm = {
	fields: Map<string, string>;
	emailInput: FakeInput;
	passwordInput: FakeInput;
	submitHandler?: (event: { preventDefault: () => void }) => void;
	submitButton?: SubmitButton | null;
	querySelector: (selector: string) => unknown;
	addEventListener: (
		eventName: string,
		handler: (event: { preventDefault: () => void }) => void,
	) => void;
};

const scriptPath = path.join(process.cwd(), "public/scripts/auth.js");
const script = readFileSync(scriptPath, "utf8");

const createLoginForm = (initialEmail = "", initialPassword = "", withSubmitButton = false): FakeForm => {
	const emailInput = { value: initialEmail };
	const passwordInput = { value: initialPassword };

	const submitButton: SubmitButton | null = withSubmitButton
		? {
				clickHandler: undefined,
				addEventListener(eventName: string, handler: (event: { preventDefault: () => void }) => void) {
					if (eventName === "click") {
						this.clickHandler = handler;
					}
				},
			}
		: null;

	return {
		fields: new Map([
			["email", initialEmail],
			["password", initialPassword],
		]),
		emailInput,
		passwordInput,
		submitButton,
		querySelector(selector: string) {
			if (selector === 'input[name="email"]') {
				return emailInput;
			}

			if (selector === 'input[name="password"]') {
				return passwordInput;
			}

			if (selector === '[type="submit"]') {
				return submitButton;
			}

			return null;
		},
		addEventListener(eventName: string, handler) {
			if (eventName === "submit") {
				this.submitHandler = handler;
			}
		},
	};
};

const runScript = ({
	page = "home",
	demoAuthEnabled = false,
	withAuthAction = true,
	withGreeting = true,
	withLogoutTrigger = true,
	withErrorRegion = false,
	loginForm,
	markInputsAsElements = true,
	pathname = "/job-roles/1/apply",
	search = "",
	sessionEntries = [],
	fetchMock,
	jobApplicationFormRoleId,
	launchMinigame,
}: {
	page?: string;
	demoAuthEnabled?: boolean;
	withAuthAction?: boolean;
	withGreeting?: boolean;
	withLogoutTrigger?: boolean;
	withErrorRegion?: boolean;
	loginForm?: FakeForm;
	markInputsAsElements?: boolean;
	pathname?: string;
	search?: string;
	sessionEntries?: Array<[string, string]>;
	fetchMock?: ReturnType<typeof vi.fn>;
	jobApplicationFormRoleId?: string;
	launchMinigame?: () => void;
}) => {
	const sessionValues = new Map<string, string>(sessionEntries);
	const loginPrompt = { hidden: true };
	const greeting = { hidden: true, textContent: "" };
	const errorRegion = { hidden: true, textContent: "" };
	const reload = vi.fn();
	const assign = vi.fn();

	const logoutTrigger = {
		clickHandler: undefined as undefined | (() => void),
		addEventListener(eventName: string, handler: () => void) {
			if (eventName === "click") {
				this.clickHandler = handler;
			}
		},
	};

	const authAction = {
		innerHTML: "",
		querySelector(selector: string) {
			if (selector === "[data-logout-trigger]" && withLogoutTrigger) {
				return logoutTrigger;
			}
			return null;
		},
	};

	class FakeHtmlFormElement {}
	class FakeHtmlInputElement {}

	const formInstance = loginForm
		? Object.assign(Object.create(FakeHtmlFormElement.prototype), loginForm)
		: null;
	if (formInstance && markInputsAsElements) {
		Object.setPrototypeOf(formInstance.emailInput, FakeHtmlInputElement.prototype);
		Object.setPrototypeOf(
			formInstance.passwordInput,
			FakeHtmlInputElement.prototype,
		);
	}

	const jobApplicationFormEl = jobApplicationFormRoleId
		? Object.assign(Object.create(FakeHtmlFormElement.prototype), {
				dataset: { jobRoleId: jobApplicationFormRoleId },
			})
		: null;

	class FakeFormData {
		constructor(private readonly form: FakeForm) {}

		get(name: string): string | null {
			if (name === "email") {
				return this.form.emailInput.value;
			}
			if (name === "password") {
				return this.form.passwordInput.value;
			}
			return null;
		}
	}

	const sandbox = {
		window: {
			btoa: (value: string) => Buffer.from(value, "binary").toString("base64"),
			location: {
				pathname,
				search,
				reload,
				assign,
			},
			sessionStorage: {
				getItem(key: string) {
					return sessionValues.get(key) ?? null;
				},
				removeItem(key: string) {
					sessionValues.delete(key);
				},
				setItem(key: string, value: string) {
					sessionValues.set(key, value);
				},
			},
			fetch: fetchMock ?? vi.fn().mockRejectedValue(new Error("network unavailable")),
			...(launchMinigame ? { launchMinigame } : {}),
		},
		document: {
			body: {
				dataset: {
					page,
					demoAuthEnabled: String(demoAuthEnabled),
				},
			},
			querySelector(selector: string) {
				if (selector === "[data-auth-action]") {
					return withAuthAction ? authAction : null;
				}

				if (selector === "[data-auth-greeting]") {
					return withGreeting ? greeting : null;
				}

				if (selector === "[data-login-form]") {
					return formInstance;
				}

				if (selector === "[data-login-error]") {
					return withErrorRegion ? errorRegion : null;
				}

				if (selector === "[data-job-application-form]") {
					return jobApplicationFormEl;
				}

				return null;
			},
			querySelectorAll(selector: string) {
				if (selector === "[data-login-prompt]") {
					return [loginPrompt];
				}
				return [];
			},
		},
		HTMLFormElement: FakeHtmlFormElement,
		HTMLInputElement: FakeHtmlInputElement,
		FormData: FakeFormData,
		URLSearchParams,
		console,
		Buffer,
		Math,
		Date,
		JSON,
		Promise,
		setTimeout,
		clearTimeout,
	};

	vm.runInNewContext(script, sandbox, { filename: scriptPath });

	return {
		authAction,
		greeting,
		loginPrompt,
		errorRegion,
		logoutTrigger,
		sessionValues,
		reload,
		assign,
		form: formInstance,
	};
};

describe("auth browser script", () => {
	it("returns early when body is missing", () => {
		const sandbox = {
			window: {
				btoa: (value: string) => Buffer.from(value, "binary").toString("base64"),
				location: {
					pathname: "/",
				},
				sessionStorage: {
					getItem() {
						return null;
					},
					removeItem() {},
					setItem() {},
				},
			},
			document: {
				body: null,
				querySelector() {
					return null;
				},
				querySelectorAll() {
					return [];
				},
			},
			console,
			Buffer,
			Math,
			Date,
			JSON,
			setTimeout,
			clearTimeout,
		};

		expect(() => vm.runInNewContext(script, sandbox, { filename: scriptPath })).not.toThrow();
	});

	it("renders login state when user is not authenticated", () => {
		const result = runScript({
			page: "home",
			demoAuthEnabled: false,
			pathname: "/job-roles/2",
			sessionEntries: [],
		});

		expect(result.authAction.innerHTML).toContain('/login?returnTo=%2Fjob-roles%2F2');
		expect(result.loginPrompt.hidden).toBe(false);
		expect(result.greeting.hidden).toBe(true);
		expect(result.greeting.textContent).toBe("");
	});

	it("renders login state without greeting element", () => {
		const result = runScript({
			page: "home",
			withGreeting: false,
			sessionEntries: [],
		});

		expect(result.authAction.innerHTML).toContain("Log in");
		expect(result.loginPrompt.hidden).toBe(false);
	});

	it("does nothing when auth action container is missing", () => {
		const result = runScript({
			page: "home",
			withAuthAction: false,
			sessionEntries: [
				["demoAuthEmail", "test@test.com"],
				["demoAuthToken", "demo-token"],
			],
		});

		expect(result.greeting.textContent).toBe("");
	});

	it("reloads the page after logout", async () => {
		const fetchMock = vi.fn().mockResolvedValue({ ok: true });
		const result = runScript({
			page: "home",
			sessionEntries: [
				["demoAuthEmail", "test@test.com"],
				["demoAuthToken", "demo-token"],
			],
			fetchMock,
		});

		expect(result.logoutTrigger.clickHandler).toBeTypeOf("function");
		expect(result.greeting.hidden).toBe(false);
		expect(result.greeting.textContent).toBe("Welcome back, test@test.com");

		await result.logoutTrigger.clickHandler?.();

		expect(result.sessionValues.get("demoAuthEmail")).toBeUndefined();
		expect(result.sessionValues.get("demoAuthToken")).toBeUndefined();
		expect(fetchMock).toHaveBeenCalledWith("/logout", { method: "POST" });
		expect(result.reload).toHaveBeenCalledTimes(1);
	});

	it("supports authenticated state without greeting and logout button", () => {
		const result = runScript({
			page: "home",
			withGreeting: false,
			withLogoutTrigger: false,
			sessionEntries: [
				["demoAuthEmail", "test@test.com"],
				["demoAuthToken", "demo-token"],
			],
		});

		expect(result.authAction.innerHTML).toContain("Log out");
		expect(result.logoutTrigger.clickHandler).toBeUndefined();
	});

	it("returns on login page when form is missing", () => {
		expect(() => runScript({ page: "login", demoAuthEnabled: true })).not.toThrow();
	});

	it("prepopulates demo login credentials when enabled", () => {
		const form = createLoginForm();

		const result = runScript({
			page: "login",
			demoAuthEnabled: true,
			loginForm: form,
		});

		expect(result.form?.emailInput.value).toBe("test@test.com");
		expect(result.form?.passwordInput.value).toBe("passwordtest");
	});

	it("does not prepopulate when login fields are not HTML input elements", () => {
		const form = createLoginForm("original-email", "original-password");

		const result = runScript({
			page: "login",
			demoAuthEnabled: true,
			loginForm: form,
			markInputsAsElements: false,
		});

		expect(result.form?.emailInput.value).toBe("original-email");
		expect(result.form?.passwordInput.value).toBe("original-password");
	});

	it("shows network error when login service is unavailable", async () => {
		const form = createLoginForm("wrong@test.com", "wrong");

		const result = runScript({
			page: "login",
			demoAuthEnabled: false,
			loginForm: form,
			withErrorRegion: true,
			fetchMock: vi.fn().mockRejectedValue(new Error("network unavailable")),
		});

		const preventDefault = vi.fn();
		await result.form?.submitHandler?.({ preventDefault });

		expect(preventDefault).toHaveBeenCalledTimes(1);
		expect(result.errorRegion.hidden).toBe(false);
		expect(result.errorRegion.textContent).toBe(
			"Unable to reach the server. Please check your connection and try again.",
		);
		expect(result.sessionValues.get("demoAuthEmail")).toBeUndefined();
		expect(result.sessionValues.get("demoAuthToken")).toBeUndefined();
		expect(result.assign).not.toHaveBeenCalled();
	});

	it("shows invalid credentials message for wrong password", async () => {
		const form = createLoginForm("test@test.com", "wrong-password");

		const result = runScript({
			page: "login",
			demoAuthEnabled: true,
			loginForm: form,
			withErrorRegion: true,
			fetchMock: vi.fn().mockResolvedValue({
				ok: false,
				status: 401,
				json: async () => ({ message: "Invalid email or password." }),
			}),
		});

		if (result.form) {
			result.form.emailInput.value = "test@test.com";
			result.form.passwordInput.value = "wrong-password";
		}

		await result.form?.submitHandler?.({ preventDefault: () => undefined });

		expect(result.errorRegion.hidden).toBe(false);
		expect(result.errorRegion.textContent).toBe(
			"Invalid email or password.",
		);
		expect(result.sessionValues.get("demoAuthEmail")).toBeUndefined();
		expect(result.sessionValues.get("demoAuthToken")).toBeUndefined();
		expect(result.assign).not.toHaveBeenCalled();
	});

	it("stores session and redirects to returnTo when credentials are valid", async () => {
		const form = createLoginForm("test@test.com", "passwordtest");

		const result = runScript({
			page: "login",
			demoAuthEnabled: true,
			loginForm: form,
			search: "?returnTo=%2Fjob-roles%2F5%2Fapply",
			withErrorRegion: true,
			fetchMock: vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => ({ accessToken: "header.payload.signature" }),
			}),
		});

		await result.form?.submitHandler?.({ preventDefault: () => undefined });

		expect(result.errorRegion.hidden).toBe(true);
		expect(result.errorRegion.textContent).toBe("");
		expect(result.sessionValues.get("demoAuthEmail")).toBe("test@test.com");
		expect(result.sessionValues.get("demoAuthToken")).toBe("header.payload.signature");
		expect(result.assign).toHaveBeenCalledWith("/job-roles/5/apply");
	});

	it("does not fail when login error region is absent", () => {
		const form = createLoginForm("test@test.com", "wrong-password");

		const result = runScript({
			page: "login",
			demoAuthEnabled: true,
			loginForm: form,
			withErrorRegion: false,
		});

		expect(() =>
			result.form?.submitHandler?.({ preventDefault: () => undefined }),
		).not.toThrow();
	});

	it("shows error when login response JSON is unparseable", async () => {
		const form = createLoginForm("test@test.com", "passwordtest");

		const result = runScript({
			page: "login",
			loginForm: form,
			withErrorRegion: true,
			fetchMock: vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => {
					throw new Error("invalid json");
				},
			}),
		});

		await result.form?.submitHandler?.({ preventDefault: () => undefined });

		expect(result.errorRegion.hidden).toBe(false);
		expect(result.errorRegion.textContent).toBe("Login failed. Please try again.");
		expect(result.assign).not.toHaveBeenCalled();
	});

	it("shows error when login response contains no access token", async () => {
		const form = createLoginForm("test@test.com", "passwordtest");

		const result = runScript({
			page: "login",
			loginForm: form,
			withErrorRegion: true,
			fetchMock: vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => ({}),
			}),
		});

		await result.form?.submitHandler?.({ preventDefault: () => undefined });

		expect(result.errorRegion.hidden).toBe(false);
		expect(result.errorRegion.textContent).toBe("Login failed. Please try again.");
		expect(result.assign).not.toHaveBeenCalled();
	});

	it("redirects to job role page on logout from the job-application page", async () => {
		const fetchMock = vi.fn().mockResolvedValue({ ok: true });
		const result = runScript({
			page: "job-application",
			jobApplicationFormRoleId: "42",
			sessionEntries: [
				["demoAuthEmail", "test@test.com"],
				["demoAuthToken", "demo-token"],
			],
			fetchMock,
		});

		expect(result.logoutTrigger.clickHandler).toBeTypeOf("function");

		await result.logoutTrigger.clickHandler?.();

		expect(result.assign).toHaveBeenCalledWith("/job-roles/42");
		expect(result.reload).not.toHaveBeenCalled();
	});

	it("triggers the minigame when the easter egg credentials are used", () => {
		const launchMinigame = vi.fn();
		const form = createLoginForm("fun", "forme", true);

		const result = runScript({
			page: "login",
			loginForm: form,
			launchMinigame,
		});

		expect(result.form?.submitButton?.clickHandler).toBeTypeOf("function");

		const event = { preventDefault: vi.fn() };
		result.form?.submitButton?.clickHandler?.(event);

		expect(event.preventDefault).toHaveBeenCalledTimes(1);
		expect(launchMinigame).toHaveBeenCalledTimes(1);
	});

	it("prevents default without calling minigame when window.launchMinigame is not defined", () => {
		const form = createLoginForm("fun", "forme", true);

		const result = runScript({
			page: "login",
			loginForm: form,
			// no launchMinigame option → window.launchMinigame is undefined
		});

		const event = { preventDefault: vi.fn() };
		result.form?.submitButton?.clickHandler?.(event);

		expect(event.preventDefault).toHaveBeenCalledTimes(1);
	});

	it("uses the default error message when 401 response body has no string message", async () => {
		const form = createLoginForm("test@test.com", "wrong");

		const result = runScript({
			page: "login",
			loginForm: form,
			withErrorRegion: true,
			fetchMock: vi.fn().mockResolvedValue({
				ok: false,
				status: 401,
				json: async () => ({}), // no message field
			}),
		});

		await result.form?.submitHandler?.({ preventDefault: () => undefined });

		expect(result.errorRegion.textContent).toBe("Invalid email or password. Please try again.");
	});
});
