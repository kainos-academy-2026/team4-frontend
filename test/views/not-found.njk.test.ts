import path from "node:path";

import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

describe("not-found template", () => {
	it("renders not-found heading and back-to-home action", () => {
		const viewsPath = path.join(process.cwd(), "src/views");
		const environment = nunjucks.configure(viewsPath, {
			autoescape: true,
			noCache: true,
		});

		const html = environment.render("not-found.njk", {
			title: "Page not found",
			message: "The page you requested does not exist.",
		});

		expect(html).toContain("<h1>404</h1>");
		expect(html).toContain("Page not found");
		expect(html).toContain('href="/"');
		expect(html).toContain("Back to home");
	});
});
