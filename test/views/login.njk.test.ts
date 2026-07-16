import path from "node:path";

import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

describe("login page template", () => {
	it("renders the branded login page contract", () => {
		const viewsPath = path.join(process.cwd(), "src/views");
		const environment = nunjucks.configure(viewsPath, {
			autoescape: true,
			noCache: true,
		});

		const html = environment.render("login.njk", { errorMessage: null });

		expect(html).toContain("class=\"kainos-header kainos-header--with-actions\"");
		expect(html).toContain("src=\"/images/kainoslogo.png\"");
		expect(html).toContain("href=\"/styles/branding.css\"");
		expect(html).toContain("<h1 class=\"kainos-auth-title\">Log in</h1>");
		expect(html).toContain('href="/">Home</a>');
		expect(html).toContain("data-login-form");
		expect(html).toContain('method="post"');
		expect(html).toContain('action="/login"');
		expect(html).toContain('type="email"');
		expect(html).toContain('type="password"');
		expect(html).toContain("data-login-error");
		expect(html).not.toContain('href="/login">Log in</a>');
		expect(html).not.toContain("/scripts/auth.js");
	});

	it("renders login errors when provided", () => {
		const viewsPath = path.join(process.cwd(), "src/views");
		const environment = nunjucks.configure(viewsPath, {
			autoescape: true,
			noCache: true,
		});

		const html = environment.render("login.njk", {
			errorMessage: "Invalid email or password. Please try again.",
		});

		expect(html).toContain("Invalid email or password. Please try again.");
		expect(html).not.toContain("hidden");
	});
});