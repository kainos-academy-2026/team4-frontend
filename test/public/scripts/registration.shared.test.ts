import { describe, expect, it } from "vitest";

import { createRegistrationPayload } from "../../../public/scripts/registration.shared.js";

describe("registration shared client helpers", () => {
	it("creates strict payload with only email and password", () => {
		const payload = createRegistrationPayload("  new.user@example.com ", "Password!");

		expect(payload).toEqual({
			email: "new.user@example.com",
			password: "Password!",
		});
		expect(Object.keys(payload)).toEqual(["email", "password"]);
	});
});
