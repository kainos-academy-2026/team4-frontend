import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";

import { describe, expect, it, vi } from "vitest";

describe("auth browser script", () => {
	it("reloads the page after logout", () => {
		const scriptPath = path.join(process.cwd(), "public/scripts/auth.js");
		const script = readFileSync(scriptPath, "utf8");

		const sessionValues = new Map<string, string>([
			["demoAuthEmail", "test@test.com"],
			["demoAuthToken", "demo-token"],
		]);

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
				if (selector === "[data-logout-trigger]") {
					return logoutTrigger;
				}

				return null;
			},
		};

		const greeting = {
			hidden: true,
			textContent: "",
		};

		const loginPrompt = {
			hidden: true,
		};

		const reload = vi.fn();

		const sandbox = {
			window: {
				btoa: (value: string) => Buffer.from(value, "binary").toString("base64"),
				location: {
					pathname: "/job-roles/1/apply",
					reload,
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
			},
			document: {
				body: {
					dataset: {
						page: "home",
						demoAuthEnabled: "false",
					},
				},
				querySelector(selector: string) {
					if (selector === "[data-auth-action]") {
						return authAction;
					}

					if (selector === "[data-auth-greeting]") {
						return greeting;
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
			console,
			Buffer,
			Math,
			Date,
			JSON,
			setTimeout,
			clearTimeout,
		};

		vm.runInNewContext(script, sandbox, { filename: scriptPath });

		expect(logoutTrigger.clickHandler).toBeTypeOf("function");

		logoutTrigger.clickHandler?.();

		expect(sessionValues.get("demoAuthEmail")).toBeUndefined();
		expect(sessionValues.get("demoAuthToken")).toBeUndefined();
		expect(reload).toHaveBeenCalledTimes(1);
	});
});