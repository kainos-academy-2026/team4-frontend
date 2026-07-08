import path from "node:path";

import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

describe("login page template", () => {
	it("renders the login form contract", () => {
		const viewsPath = path.join(process.cwd(), "src/views");
		const environment = nunjucks.configure(viewsPath, {
			autoescape: true,
			noCache: true,
		});

		const html = environment.render("login.njk");

		expect(html).toContain("<h1 id=\"login-title\">Log in</h1>");
		expect(html).toContain("class=\"kainos-navbar\"");
		expect(html).toContain("src=\"/images/kainoslogo.png\"");
		expect(html).not.toContain("aria-current=\"page\"");
		expect(html).not.toContain("href=\"/login\"");
		expect(html).toContain("data-login-form");
		expect(html).toContain("name=\"email\"");
		expect(html).toContain("name=\"password\"");
		expect(html).toContain("/scripts/auth-session.js");
		expect(html).toContain("Contact: support@kainos.com");
		expect(html).toContain("Phone: +44 28 9089 0000");
	});
});