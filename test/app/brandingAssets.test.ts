import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("branding static assets", () => {
  it("has required logo and favicon assets available", () => {
    const logoPath = path.join(process.cwd(), "public/images/kainoslogo.png");
    const faviconPath = path.join(process.cwd(), "public/images/favicon.png");

    const logoStats = fs.statSync(logoPath);
    const faviconStats = fs.statSync(faviconPath);

    expect(logoStats.isFile()).toBe(true);
    expect(faviconStats.isFile()).toBe(true);
    expect(logoStats.size).toBeGreaterThan(0);
    expect(faviconStats.size).toBeGreaterThan(0);
  });
});