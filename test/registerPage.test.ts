import path from "node:path";

import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

describe("register page template", () => {
	it("renders the branded registration page contract", () => {
		const viewsPath = path.join(process.cwd(), "src/views");
		const environment = nunjucks.configure(viewsPath, {
			autoescape: true,
			noCache: true,
		});

		const html = environment.render("register.njk");

		expect(html).toContain("class=\"kainos-header kainos-header--with-actions\"");
		expect(html).toContain("src=\"/images/kainoslogo.png\"");
		expect(html).toContain("href=\"/styles/branding.css\"");
		expect(html).toContain("<h1 class=\"kainos-auth-title\">Create account</h1>");
		expect(html).toContain('href="/">Home</a>');
		expect(html).toContain('href="/login">Log in</a>');
		expect(html).toContain("data-register-form");
		expect(html).toContain("data-register-email");
		expect(html).toContain("data-register-password");
		expect(html).toContain("data-register-email-error");
		expect(html).toContain("data-register-password-error");
		expect(html).toContain("data-register-status");
		expect(html).toContain("data-register-submit");
		expect(html).toContain("/scripts/auth.js");
	});
});
