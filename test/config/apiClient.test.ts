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
