import path from "node:path";

import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

describe("home page template", () => {
  it("renders the Hello World message", () => {
    const viewsPath = path.join(process.cwd(), "src/views");
    const environment = nunjucks.configure(viewsPath, {
      autoescape: true,
      noCache: true,
    });

    const html = environment.render("index.njk");

    expect(html).toContain("Hello world");
  });
});