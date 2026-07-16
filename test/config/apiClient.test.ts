import { describe, expect, it } from "vitest";

import apiClient from "../../src/config/apiClient";

describe("apiClient", () => {
	it("uses JSON content type and timeout defaults", () => {
		expect(apiClient.defaults.headers["Content-Type"]).toBe(
			"application/json",
		);
		expect(apiClient.defaults.timeout).toBe(5000);
	});
});
import { describe, expect, it, vi } from "vitest";

import apiClient from "../../src/config/apiClient";

describe("apiClient", () => {
	it("uses JSON content type and timeout defaults", () => {
		expect(apiClient.defaults.headers["Content-Type"]).toBe(
			"application/json",
		);
		expect(apiClient.defaults.timeout).toBe(5000);
	});

	it("uses API_BASE_URL when provided", async () => {
		vi.resetModules();
		process.env.API_BASE_URL = "http://api.example.test";

		const { default: freshClient } = await import("../../src/config/apiClient");

		expect(freshClient.defaults.baseURL).toBe("http://api.example.test");
	});

	it("falls back to localhost when API_BASE_URL is undefined", async () => {
		vi.resetModules();
		delete process.env.API_BASE_URL;

		const { default: freshClient } = await import("../../src/config/apiClient");

		expect(freshClient.defaults.baseURL).toBe("http://localhost:4000");
		process.env.API_BASE_URL = "http://localhost:4000";
	});
});
