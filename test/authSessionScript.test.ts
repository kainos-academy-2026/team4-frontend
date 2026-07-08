import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("auth session script", () => {
	it("contains session cookie handling for login and logout", () => {
		const scriptPath = path.join(process.cwd(), "public/scripts/auth-session.js");
		const script = fs.readFileSync(scriptPath, "utf-8");

		expect(script).toContain("team4_session_token");
		expect(script).toContain("team4_session_email");
		expect(script).toContain("mock.jwt.token");
		expect(script).toContain("document.cookie");
		expect(script).toContain("window.location.assign(\"/\")");
		expect(script).toContain("window.location.assign(\"/login\")");
		expect(script).toContain("data-login-form");
		expect(script).toContain("data-logout-action");
	});
});