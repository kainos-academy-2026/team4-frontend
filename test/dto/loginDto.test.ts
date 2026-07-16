import { describe, expect, it } from "vitest";

import { LoginRequestSchema } from "../../src/dto/loginDto";

describe("LoginRequestSchema", () => {
	it("accepts valid login payload", () => {
		const result = LoginRequestSchema.safeParse({
			email: "test@example.com",
			password: "Password123!",
		});

		expect(result.success).toBe(true);
	});

	it("rejects empty fields", () => {
		const result = LoginRequestSchema.safeParse({
			email: "",
			password: "",
		});

		expect(result.success).toBe(false);
	});
});
