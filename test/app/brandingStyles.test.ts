import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("branding stylesheet contract", () => {
  it("contains required Kainos styling tokens and responsive rules", () => {
    const cssPath = path.join(process.cwd(), "public/styles/branding.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    expect(css).toContain("--kainos-primary-blue: #2e36a5;");
    expect(css).toContain("--kainos-text-navy: #1f2b4d;");
    expect(css).toContain("font-family: \"Inter\", \"Poppins\", \"Montserrat\"");
    expect(css).toContain(".kainos-header-actions");
    expect(css).toContain(".kainos-auth-card");
    expect(css).toContain(".kainos-greeting");
    expect(css).toContain(".kainos-footer");
    expect(css).toContain("background: #313147;");
    expect(css).toContain(".badge--closed");
    expect(css).toContain("background: #fff4e6;");
    expect(css).toContain("color: #c2410c;");
    expect(css).toContain("@media (max-width: 900px)");
    expect(css).toContain("@media (max-width: 540px)");
  });
});