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

    const html = environment.render("index.njk");

    expect(html).toContain("Hello World");
    expect(html).toContain("class=\"kainos-header\"");
    expect(html).toContain("class=\"kainos-navbar\"");
    expect(html).toContain("href=\"/login\"");
    expect(html).toContain("data-auth-signed-out-link");
    expect(html).toContain("data-auth-signed-in-state");
    expect(html).toContain("data-logout-action");
    expect(html).toContain("src=\"/images/kainoslogo.png\"");
    expect(html).toContain("rel=\"icon\"");
    expect(html).toContain("href=\"/images/favicon.png\"");
    expect(html).toContain("href=\"/styles/branding.css\"");
    expect(html).toContain("/scripts/auth-session.js");
    expect(html).toContain("class=\"kainos-footer\"");
    expect(html).toContain("Contact: support@kainos.com");
    expect(html).toContain("Phone: +44 28 9089 0000");
  });
});