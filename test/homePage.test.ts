import path from "node:path";

import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

describe("home page template", () => {
  it("renders the branded home page contract", () => {
    const viewsPath = path.join(process.cwd(), "src/views");
    const environment = nunjucks.configure(viewsPath, {
      autoescape: true,
      noCache: true,
    });

    const html = environment.render("index.njk", { demoAuthEnabled: false });

    expect(html).toContain("Hello world");
    expect(html).toContain("class=\"kainos-header kainos-header--with-actions\"");
    expect(html).toContain("src=\"/images/kainoslogo.png\"");
    expect(html).toContain("rel=\"icon\"");
    expect(html).toContain("href=\"/images/favicon.png\"");
    expect(html).toContain("href=\"/styles/branding.css\"");
    expect(html).toContain("class=\"kainos-footer\"");
    expect(html).toContain("data-home-auth-action");
    expect(html).toContain('href="/login"');
    expect(html).toContain("data-auth-greeting");
    expect(html).toContain("src=\"/scripts/auth.js\"");
    expect(html).toContain("careers@kainosjobs.example");
    expect(html).toContain("+44 28 9000 0000");
  });
});